import path from 'path';
import { Database } from 'sqlite3';
import { RequestHandler } from 'express';

import { User } from '../models';
import { DBUser, DBTask } from '../models/db';
import log from '../utils/log';

import config from '../settings/config';

const isAuthenticated: RequestHandler = (req, res, next): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(403).redirect('/login');
};

const isNotAuthenticated: RequestHandler = (req, res, next): void => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.status(403).redirect('/');
};

const isAdmin: RequestHandler = (req, res, next): void => {
  if (req.isAuthenticated() && (req.user as User).admin) {
    return next();
  }
  res.status(403).redirect('/tasks');
};

const getAll = (db: Database): RequestHandler => (_, res): void => {
  db.all('SELECT u.user_id, u.user_name, SUM(t.task_points) '
    + 'FROM user AS u LEFT JOIN stask AS s ON s.user_id = u.user_id '
    + 'LEFT JOIN task AS t ON s.task_id = t.task_id '
    + 'WHERE u.user_admin = 0 '
    + 'GROUP BY u.user_id ORDER BY SUM(t.task_points) DESC, s.stask_date ASC',
  (error, users: DBUser[]) => {
    if (error) throw error;

    const newUsers: User[] = users.map((user) => ({
      id: user.user_id,
      name: user.user_name,
      points: user['SUM(t.task_points)'] ?? 0,
    }));
    res.status(200).json({ users: newUsers });
  });
};

const submit = (db: Database): RequestHandler => (req, res): void => {
  const taskId = parseInt(req.body.task_id, 10);
  const user = req.user as User;
  const userId = user.id;
  const userName = user.name;
  const flag = req.body.task_flag.trim().replace('\n', '');

  db.get('SELECT * FROM task AS t LEFT JOIN stask AS s ON s.task_id = t.task_id '
    + 'AND s.user_id = (?) WHERE t.task_id=(?) AND t.task_flag=(?)',
  userId, taskId, flag, (error, task: DBTask) => {
    if (error) throw error;

    if (!task) {
      req.flash('error', 'Flag is invalid');
      log(path.resolve('./', config.logFileDir), `${userName} has submitted a WRONG flag`, { userId, taskId, flag });
      return res.status(400).redirect(req.headers.referer ?? '/');
    }

    if (task.stask_id) {
      req.flash('error', 'You have already completed this task');
      log(path.resolve('./', config.logFileDir), `${userName} tries to submit a flag on completed task`, { userId, taskId });
      return res.status(400).redirect(req.headers.referer ?? '/');
    }

    const currentDate: number = Date.now();
    db.run('INSERT INTO stask (stask_date, task_id, user_id) VALUES (?, ?, ?)',
      currentDate, taskId, userId, () => {
        req.flash('message', 'Flag was submitted!');
        log(path.resolve('./', config.logFileDir), `${userName} has solved a task!`, { userId, taskId });
        return res.status(200).redirect(req.headers.referer ?? '/');
      });
  });
};

export default {
  isAuthenticated,
  isNotAuthenticated,
  isAdmin,
  getAll,
  submit,
};
