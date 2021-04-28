import crypto from 'crypto';
import { RequestHandler } from 'express';
import path from 'path';
import { Controller } from '../models/database';
import { Task, User } from '../models/units';
import log from '../utils/log';
import response, { projection } from '../utils/response';

const isAuthenticated: RequestHandler = (req, res, next): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json(response.fail({}, 'User should be authenticated'));
};

const isNotAuthenticated: RequestHandler = (req, res, next): void => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.status(403).json(response.fail({}, 'User is authenticated already'));
};

const isAdmin: RequestHandler = (req, res, next): void => {
  if ((req.user as User).admin) {
    return next();
  }
  res.status(403).json(response.fail({}, 'User does not have enough privileges to do this'));
};

/** AUTHORIZATION HANDLERS START */
const login: Controller = (db, config) => async (req, res): Promise<void> => {
  const {
    name,
    password,
  } = req.body;

  if (!name || !password) {
    res.status(400).json(response.fail(projection({
      name: 'A name is required',
      password: 'A password is required',
    }, { name, password })));
    return;
  }

  db.users.findOne({ name }, (error: Error, user: User) => {
    if (error) {
      res.status(500).json(response.error('Server shutdowns due to internal critical error'));
      throw error;
    }

    const date = Date.now();
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (user) {
      const passHash = crypto.pbkdf2Sync(password, config.secret, 1, 32, 'sha512').toString('hex');
      if (user?.password == passHash) {
        req.login(user, (error) => { // TODO: clean user from password
          if (error) {
            res.status(500).json(response.error('Server shutdowns due to internal critical error'));
            throw error;
          }
          const resUser: User = {
            ...user,
            password,
          };
          res.status(200).json(response.success({ user: resUser }));
          log(path.resolve('./', config.logFileDir, 'authorization.txt'), '', {
            userId: resUser._id,
            userName: resUser.name,
            date,
            success: true,
            ip,
          });
        });
      } else {
        res.status(401).json(response.fail({}, 'Incorrect Creditals'));
        log(path.resolve('./', config.logFileDir, 'authorization.txt'), '', {
          userName: user.name,
          date,
          success: false,
          message: 'Неправльный пароль',
          ip,
        });
      }
    } else {
      res.status(401).json(response.fail({}, 'Incorrect Creditals'));
      log(path.resolve('./', config.logFileDir, 'authorization.txt'), '', {
        userName: name,
        date,
        success: false,
        message: 'Неправльный логин',
        ip,
      });
    }
  });
};

const logout: RequestHandler = (req, res): void => {
  req.logout();
  res.status(200).json(response.success());
};

const register: Controller = (db, config) => async (req, res): Promise<void> => {
  const {
    name,
    email,
    password,
    password2
  } = req.body;

  if (!name || !email || !password || !password2) {
    res.status(400).json(response.fail(projection({
      name: 'A name is required',
      email: 'An email is required',
      password: 'A password is required',
      password2: 'A password2 is required',
    }, { name, email, password, password2 })));
    return;
  }

  if (password != password2) {
    res.status(401).json(response.fail({}, 'Passwords are required to be identical'));
    return;
  }

  db.users.findOne({ $or: [{ name }, { email }] }, (error: Error, user: User) => {
    if (error) {
      res.status(500).json(response.error('Server shutdowns due to internal critical error'));
      throw error;
    }

    if (user) {
      res.status(401).json(response.fail({}, 'User with this creditals already exists'));
      return;
    }

    const derviedKey = crypto.pbkdf2Sync(password, config.secret, 1, 32, 'sha512').toString('hex');
    db.users.insert({ name, email, password: derviedKey },
      (error: Error, user: any) => {
        if (error) {
          res.status(500).json(response.error('Server shutdowns due to internal critical error'));
          throw error;
        }

        req.login(user, (error: Error) => { // TODO: clean user from password
          if (error) {
            res.status(500).json(response.error('Server shutdowns due to internal critical error'));
            throw error;
          }
          const resUser: User = {
            ...user,
            password,
          };
          res.status(201).json(response.success({ user: resUser }));
        });
      });
  });
};
/** AUTHORIZATION HANDLERS END */

const taskSubmit: Controller = (db, config) => (req, res): void => {
  const { taskId } = req.body;
  const flag = req.body.flag.trim().replace('\n', '');
  const user = req.user as User;
  const userId = user._id;

  if (!taskId || !flag) {
    res.status(400).json(response.fail(projection({
      taskId: 'A taskId is required',
      flag: 'An flag is required',
    }, { taskId, flag })));
    return;
  }

  db.tasks.findOne({ _id: taskId }, (error: Error, task: Task) => {
    if (error) {
      res.status(500).json(response.error('Server shutdowns due to internal critical error'));
      throw error;
    }

    if (!task) {
      res.status(404).json(response.error(`Task with ${taskId} id is not exist`));
      return;
    }

    if (task.solved?.find((solved) => solved.userId == userId)) {
      res.status(409).json(response.error(`Task with ${taskId} id already has been solved`));
      // FAREASTCTF MODIFICATION
      // log(path.resolve('./', config.logFileDir, config.logFileName), `${user.name} tries to submit a flag on completed task`, { userId, taskId });
      return;
    }

    const date = Date.now();
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (task.flag != flag) {
      res.status(200).json(response.success({ message: 'Flag is invalid' }));
      // FAREASTCTF MODIFICATION
      log(path.resolve('./', config.logFileDir, config.logFileName), `${user.name} has submitted a WRONG flag`, {
        userId,
        userName: user.name,
        taskId,
        taskName: task.name,
        flag,
        date,
        success: false,
        points: task.points - task.points * task.solved.length * 0.01,
        ip,
      });
      return;
    }

    db.tasks.update(
      { _id: task._id },
      { $push: { solved: { userId, date } } },
      { returnUpdatedDocs: true, multi: false },
      (error: Error) => {
        if (error) {
          res.status(500).json(response.error('Server shutdowns due to internal critical error'));
          throw error;
        }
        // FAREASTCTF MODIFICATION
        log(path.resolve('./', config.logFileDir, config.logFileName), `${user.name} has solved a task!`, {
          userId,
          userName: user.name,
          taskName: task.name,
          taskId,
          flag,
          date,
          success: true,
          points: task.points - task.points * task.solved.length * 0.01,
          ip,
        });
        res.status(200).json(response.success({ date }));
      }
    );
  });
};

export default {
  is: {
    authenticated: isAuthenticated,
    admin: isAdmin,
    not: {
      authenticated: isNotAuthenticated,
    }
  },
  submits: taskSubmit,
  logins: login,
  logouts: logout,
  registers: register,
};
