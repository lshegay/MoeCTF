import { UploadedFile } from 'express-fileupload';
import { Express } from 'express';
import { Database } from 'sqlite3';
import passport from 'passport';
import path from 'path';
import crypto from 'crypto';

import { isNotMatchEnded, isMatchStarted } from './controllers/match';
import { isAuthenticated, isNotAuthenticated, isAdmin } from './controllers/user';

import log from './utils/log';
import User from './models/user';
import Task from './models/task';
import Post from './models/post';
import Category from './models/category';
import config from './settings/config';
import secret from './settings/secret';
import {
  DBUser,
  DBTask,
  DBCategory,
  DBPost,
} from './models/db';

const routes = (server: Express, db: Database, handle): void => {
  /** rules start */
  server.get('/tasks', isAuthenticated, isMatchStarted);
  server.get('/scoreboard', isAuthenticated);
  server.get('/profile', isAuthenticated);
  server.get('/logout', isAuthenticated, (req, res) => {
    req.logout();
    res.redirect('/');
  });
  server.get('/login', isNotAuthenticated);
  server.get('/register', isNotAuthenticated);
  /** rules end */

  server.get('*', (req, res) => handle(req, res));

  /** routes start */
  server.post('/api/admin/create/category', isAdmin, (req, res) => {
    const { name } = req.body;

    db.run('INSERT INTO category (category_name) VALUES (?)', name, (error: Error) => {
      if (error) {
        console.error(error);
      }

      res.redirect('/tasks');
    });
  });

  server.post('/api/admin/delete/category', isAdmin, (req, res) => {
    const { id } = req.body;

    db.serialize(() => {
      db.run('DELETE FROM stask WHERE stask_id IN '
        + '(SELECT s.stask_id FROM stask AS s JOIN task AS t ON t.task_id = s.task_id '
        + 'WHERE t.category_id=(?))', id);
      db.run('DELETE FROM task WHERE category_id=(?)', id);
      db.run('DELETE FROM category WHERE category_id=(?)', id, (error: Error) => {
        if (error) {
          console.error(error);
        }

        res.redirect('/tasks');
      });
    });
  });

  server.post('/api/admin/create/post', isAdmin, (req, res) => {
    const { title, content } = req.body;

    db.run('INSERT INTO post (post_title, post_content, post_date) VALUES (?, ?, ?)',
      title, content, Date.now(), (error: Error) => {
        if (error) {
          console.error(error);
        }

        res.redirect('/');
      });
  });

  server.post('/api/admin/delete/post', isAdmin, (req, res) => {
    const { id } = req.body;

    db.serialize(() => {
      db.run('DELETE FROM post WHERE post_id=(?)', id, (error: Error) => {
        if (error) {
          console.error(error);
        }

        res.redirect('/');
      });
    });
  });

  server.post('/api/admin/create', isAdmin, (req, res) => {
    const {
      name,
      category,
      content,
      points,
      flag,
    } = req.body;

    if (Number.isNaN(parseInt(points, 10)) || Number.isNaN(parseInt(category, 10))) {
      req.flash('error', 'Points should be number');
      return res.redirect('/tasks');
    }

    const statement = db.prepare('INSERT INTO task (task_name, category_id, '
      + 'task_content, task_points, task_file, task_flag) VALUES (?, ?, ?, ?, ?, ?)',
    (error): void => {
      if (error) {
        req.flash('error', 'Something happened wrong...');
        return res.redirect('/tasks');
      }

      return res.status(200).redirect('/tasks');
    });

    if (req.files?.file) {
      const file = req.files.file as UploadedFile;

      file.mv(`./${config.staticDir}/${file.name.split(' ').join('_')}`, (error: Error) => {
        if (error) {
          return res.status(500).send(error);
        }

        statement.run(name, category, content, points, file.name.split(' ').join('_'), flag.trim().replace('\n', ''));
      });
    } else {
      statement.run(name, category, content, points, null, flag.trim().replace('\n', ''));
    }
  });

  server.post('/api/admin/update', isAdmin, (req, res) => {
    const {
      id,
      name,
      category,
      content,
      points,
      flag,
    } = req.body;

    if (Number.isNaN(parseInt(points, 10)) || Number.isNaN(parseInt(category, 10))) {
      req.flash('error', 'Points should be number');
      return res.redirect('/tasks');
    }

    const vars = [name, category, content, points];
    if (req.files?.file) vars.push((req.files.file as UploadedFile).name.replace(' ', '_'));
    if (flag) vars.push(flag.trim().replace('\n', ''));
    vars.push(id);

    const statement = db.prepare('UPDATE task SET task_name = (?), category_id = (?), '
      + 'task_content = (?), task_points = (?) '
      + `${req.files?.file ? ', task_file = (?) ' : ''}`
      + `${flag ? ', task_flag = (?) ' : ''}`
      + 'WHERE task_id = (?)',
    (error: Error): void => {
      if (error) {
        console.error(error);
        req.flash('error', 'Something happened wrong...');
        return res.redirect(`/tasks/${id}`);
      }

      return res.status(200).redirect(`/tasks/${id}`);
    });

    if (req.files?.file) {
      const file = req.files.file as UploadedFile;

      file.mv(`./${config.staticDir}/${file.name.split(' ').join('_')}`, (error: Error) => {
        if (error) {
          return res.status(500).send(error);
        }

        statement.run(vars);
      });
    } else {
      statement.run(vars);
    }
  });

  server.post('/api/admin/delete', isAdmin, (req, res) => {
    const { id } = req.body;

    db.serialize(() => {
      db.run('DELETE FROM stask WHERE task_id=(?)', id);
      db.run('DELETE FROM task WHERE task_id=(?)', id, (error: Error) => {
        if (error) {
          console.error(error);
        }

        res.redirect('/tasks');
      });
    });
  });

  server.post('/api/submit', isAuthenticated, isMatchStarted, isNotMatchEnded, (req, res) => {
    const taskId = parseInt(req.body.task_id, 10);
    const userId = (req.user as User).id;
    const userName = (req.user as User).name;
    const flag = req.body.task_flag.trim().replace('\n', '');

    db.get('SELECT * FROM task AS t LEFT JOIN stask AS s ON s.task_id = t.task_id'
      + 'AND s.user_id = (?) WHERE t.task_id=(?) AND t.task_flag=(?)',
    userId, taskId, flag, (_, task: DBTask) => {
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
  });

  server.post('/api/posts', (_, res) => {
    db.all('SELECT * FROM post ORDER BY post_date DESC', (_, posts: DBPost[]) => {
      const newPosts: Post[] = posts.map((post) => {
        const readyPost: Post = {
          id: post.post_id,
          title: post.post_title,
          content: post.post_content,
          date: post.post_date,
        };

        return readyPost;
      });

      res.status(200).json({ posts: newPosts });
    });
  });

  server.post('/api/users', (_, res) => {
    db.all('SELECT u.user_id, u.user_name, SUM(t.task_points) '
      + 'FROM user AS u LEFT JOIN stask AS s ON s.user_id = u.user_id '
      + 'LEFT JOIN task AS t ON s.task_id = t.task_id '
      + 'WHERE u.user_admin = 0 '
      + 'GROUP BY u.user_id ORDER BY SUM(t.task_points) DESC, s.stask_date ASC',
    (_, users: DBUser[]) => {
      const newUsers: User[] = users.map((user) => {
        const readyUser: User = {
          id: user.user_id,
          name: user.user_name,
          points: user['SUM(t.task_points)'] ?? 0,
        };

        return readyUser;
      });
      res.status(200).json({ users: newUsers });
    });
  });

  server.post('/api/tasks', isAuthenticated, isMatchStarted, (req, res) => {
    const { id } = req.user as User;

    db.all('SELECT t.task_id, t.task_name, t.task_content, '
      + 't.task_points, t.task_file, t.category_id, c.category_name, s.stask_id FROM task AS t '
      + 'JOIN category AS c ON c.category_id = t.category_id '
      + 'LEFT JOIN stask AS s ON s.task_id = t.task_id AND s.user_id = (?)',
    id, (_, tasks: DBTask[]) => {
      const compiledTasks: Task[] = [];
      tasks.forEach((task) => {
        const compiledTask: Task = {
          id: task.task_id,
          name: task.task_name,
          content: task.task_content,
          points: task.task_points,
          file: task.task_file,
          categoryId: task.category_id,
          categoryName: task.category_name,
          solved: !!task.stask_id,
        };

        compiledTasks.push(compiledTask);
      });

      db.all('SELECT * FROM category', (_, categories: DBCategory[]) => {
        const compiledCategories: Category[] = [];

        categories.forEach((category) => {
          const compiledCategory: Category = {
            id: category.category_id,
            name: category.category_name,
          };
          compiledCategories.push(compiledCategory);
        });

        res.status(200).json({ tasks: compiledTasks, categories: compiledCategories });
      });
    });
  });

  server.post('/api/tasks/:taskId', isAuthenticated, isMatchStarted, (req, res) => {
    const { taskId } = req.params;
    const { id } = req.user as User;

    const statement = db.prepare('SELECT t.task_id, t.task_name, t.task_content, '
      + 't.task_points, t.task_file, t.category_id, c.category_name, s.stask_id FROM task AS t '
      + 'JOIN category AS c ON c.category_id = t.category_id '
      + 'LEFT JOIN stask AS s ON s.task_id = t.task_id AND s.user_id = (?) '
      + 'WHERE t.task_id = (?)');
    statement.get(id, taskId, (_, task: DBTask) => {
      const compiledTask: Task = {
        id: task.task_id,
        name: task.task_name,
        content: task.task_content,
        points: task.task_points,
        file: task.task_file,
        categoryId: task.category_id,
        categoryName: task.category_name,
        solved: !!task.stask_id,
      };

      db.all('SELECT * FROM category', (_, categories: DBCategory[]) => {
        const compiledCategories: Category[] = [];

        categories.forEach((category) => {
          const compiledCategory: Category = {
            id: category.category_id,
            name: category.category_name,
          };
          compiledCategories.push(compiledCategory);
        });

        res.status(200).json({ task: compiledTask, categories: compiledCategories });
      });
    });
  });

  server.post('/login', isNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/tasks',
    failureRedirect: '/login',
    failureFlash: true,
  }));

  server.post('/register', isNotAuthenticated, async (req, res) => {
    const {
      username,
      email,
      password,
      password2
    } = req.body;

    if (password != password2) {
      req.flash('error', 'Passwords are not similar');
      return res.redirect('/register');
    }

    const nameStatement = db.prepare('SELECT * FROM user WHERE user_name=(?)');
    const emailStatement = db.prepare('SELECT * FROM user WHERE user_email=(?)');
    const insertStatement = db.prepare('INSERT INTO user ('
      + 'user_name, user_email, user_password) VALUES (?, ?, ?)');

    await new Promise((resolve) => {
      nameStatement.get(username, (_, existingUser) => {
        if (existingUser) {
          req.flash('error', 'User with this username already exists');
          return res.redirect('/register');
        }

        resolve();
      });
    });

    await new Promise((resolve) => {
      emailStatement.get(email, (_, existingUser2) => {
        if (existingUser2) {
          req.flash('error', 'User with this email already exists');
          return res.redirect('/register');
        }

        resolve();
      });
    });

    const hashPassword = await new Promise<string>((resolve) => {
      crypto.pbkdf2(password, secret.key, 1, 32, 'sha512', (err, derviedKey) => {
        resolve(derviedKey.toString('hex'));
      });
    });

    await new Promise((resolve) => {
      insertStatement.run([username, email, hashPassword], (error: Error) => {
        if (error) {
          console.error('DB: Something wrong happened while was trying to register a new user');
          req.flash('error', 'Something goes wrong...');
          return res.redirect('/register');
        }

        resolve();
      });
    });

    const user: Express.User = await new Promise((resolve) => {
      nameStatement.get(username, (_, user) => {
        if (!user) {
          console.error('DB: Something wrong happened in authorization of a new user');
          req.flash('error', 'Something goes wrong...');
          return res.redirect('/register');
        }

        resolve(user);
      });
    });

    await new Promise((resolve) => {
      req.login(user, (err) => {
        if (!err) {
          return res.redirect('/tasks');
        }

        console.error('DB: Something wrong happened in authorization of a new user');
        req.flash('error', 'Something goes wrong...');
        res.redirect('/register');

        resolve();
      });
    });
  });
  /** routes end */
};

export default routes;
