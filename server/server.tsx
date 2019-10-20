import express from 'express';
import session from 'express-session';
import fileUpload, { UploadedFile } from 'express-fileupload';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import nextjs from 'next';
import pbkdf2 from 'pbkdf2';
import sqlite3Original from 'sqlite3';
import connectSQLite3 from 'connect-sqlite3';
import moment, { Moment } from 'moment';
import History from './history';
import User from '../interfaces/User';
import Task from '../interfaces/Task';
import Category from '../interfaces/Category';
import config from './config';

const sqlite3 = sqlite3Original.verbose();
const SQLiteStore = connectSQLite3(session);
const dev = process.env.NODE_ENV !== 'production';
const app = nextjs({ dev });
const handle = app.getRequestHandler();
const db = new sqlite3.Database(config.database);

app.prepare()
  .then(() => {
    const server = express();
    const history = new History(config.logFileDir);

    const authBridge = (req, res, next): void => {
      if (req.isAuthenticated()) {
        return next();
      }
      res.status(403).redirect('/login');
    };

    const startMatchBridge = (req, res, next): void => {
      const currentDate: Moment = moment();

      if (!config.isTimer
        || (config.isTimer && currentDate.isSameOrAfter(config.dateStart))
        || (req.isAuthenticated() && req.user.admin)) {
        return next();
      }
      res.status(403).redirect('/');
    };

    const endMatchBridge = (req, res, next): void => {
      const currentDate: Moment = moment();

      if (!config.isTimer
        || (config.isTimer && currentDate.isBefore(config.dateEnd))
        || (req.isAuthenticated() && req.user.admin)) {
        return next();
      }

      req.flash('error', 'Match has been already finished');
      return res.redirect(req.headers.referer || '/');
    };

    const noAuthBridge = (req, res, next): void => {
      if (req.isAuthenticated()) {
        return res.status(403).redirect('/');
      }
      next();
    };

    function adminBridge(req, res, next): void {
      if (req.isAuthenticated() && req.user.admin) {
        return next();
      }
      res.status(403).redirect('/tasks');
    }

    server.use(express.static(config.staticDir));
    server.use(bodyParser.urlencoded({
      extended: true,
    }));
    server.use(bodyParser.json());
    server.use(session({
      secret: config.secret,
      resave: false,
      saveUninitialized: true,
      store: new SQLiteStore({
        db: config.databaseSessions,
      }),
      cookie: {
        secure: config.https,
        maxAge: config.cookiesAge,
      },
    }));
    server.use(fileUpload());
    server.use(flash());
    server.use(passport.initialize());
    server.use(passport.session());

    passport.use(new LocalStrategy.Strategy({
      usernameField: 'username',
      passwordField: 'password',
      session: true,
    }, (name, password, done): void => {
      const dbstatement = db.prepare('SELECT * FROM user WHERE user_name=(?)');
      const passHash = pbkdf2.pbkdf2Sync(password, config.secret, 1, 32, 'sha512').toString('hex');

      dbstatement.get(name, (err, user) => {
        if (err) {
          return done(err);
        }

        if (user && user.user_password === passHash) {
          return done(false, user);
        }

        return done(null, false, { message: 'Incorrect Creditals' });
      });
    }));

    passport.serializeUser((user: any, done) => {
      done(null, user.user_id);
    });

    passport.deserializeUser((id, done) => {
      const dbstatement = db.prepare('SELECT * FROM user WHERE user_id=(?)');

      dbstatement.get(id, (err, user) => {
        if (err) {
          return done(err);
        }

        if (user) {
          const compiledUser: User = {
            id: user.user_id,
            name: user.user_name,
            content: user.user_content,
            admin: user.user_admin,
            email: user.user_email,
            avatar: user.user_avatar,
          };

          return done(null, compiledUser);
        }

        return done(null, false);
      });
    });

    server.get('/tasks', authBridge, startMatchBridge);
    server.get('/scoreboard', authBridge);
    server.get('/profile', authBridge);
    server.get('/logout', authBridge, (req, res) => {
      req.logout();
      res.redirect('/');
    });
    server.get('/login', noAuthBridge);
    server.get('/register', noAuthBridge);

    server.get('*', (req, res) => handle(req, res));

    server.post('/api/admin/create/category', adminBridge, (req, res) => {
      const { name } = req.body;

      db.run('INSERT INTO category (category_name) VALUES (?)', name, (error) => {
        if (error) {
          res.json({ message: 'Bruh :c' });
        }

        res.redirect('/tasks');
      });
    });

    server.post('/api/admin/delete/category', adminBridge, (req, res) => {
      const { id } = req.body;

      db.serialize(() => {
        db.run('DELETE FROM stask WHERE stask_id IN '
          + '(SELECT s.stask_id FROM stask AS s JOIN task AS t ON t.task_id = s.task_id '
          + 'WHERE t.category_id=(?))', id);

        db.run('DELETE FROM task WHERE category_id=(?)', id);

        db.run('DELETE FROM category WHERE category_id=(?)', id, (error) => {
          if (error) {
            console.log(error);
          }

          res.redirect('/tasks');
        });
      });
    });

    server.post('/api/admin/create/post', adminBridge, (req, res) => {
      const { title, content } = req.body;

      db.run('INSERT INTO post (post_title, post_content, post_date) VALUES (?, ?, ?)',
        title, content, Date.now(), (error) => {
          if (error) {
            res.json({ message: 'Bruh :c' });
          }

          res.redirect('/');
        });
    });

    server.post('/api/admin/delete/post', adminBridge, (req, res) => {
      const { id } = req.body;

      db.serialize(() => {
        db.run('DELETE FROM post WHERE post_id=(?)', id, (error) => {
          if (error) {
            console.log(error);
          }

          res.redirect('/');
        });
      });
    });

    server.post('/api/admin/create', adminBridge, (req, res) => {
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

      if (req.files && req.files.file) {
        const file = req.files.file as UploadedFile;

        file.mv(`./${config.staticDir}/${file.name.replace(' ', '_')}`, (error) => {
          if (error) {
            return res.status(500).send(error);
          }

          statement.run(name, category, content, points, file.name.replace(' ', '_'), flag.trim().replace('\n', ''));
        });
      } else {
        statement.run(name, category, content, points, null, flag.trim().replace('\n', ''));
      }
    });

    server.post('/api/admin/update', adminBridge, (req, res) => {
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
      if (req.files && req.files.file) vars.push((req.files.file as UploadedFile).name.replace(' ', '_'));
      if (flag) vars.push(flag.trim().replace('\n', ''));
      vars.push(id);

      const statement = db.prepare('UPDATE task SET task_name = (?), category_id = (?), '
        + 'task_content = (?), task_points = (?) '
        + `${req.files && req.files.file ? ', task_file = (?) ' : ''}`
        + `${flag ? ', task_flag = (?) ' : ''}`
        + 'WHERE task_id = (?)',
      (error): void => {
        if (error) {
          console.log(error);
          req.flash('error', 'Something happened wrong...');
          return res.redirect(`/tasks/${id}`);
        }

        return res.status(200).redirect(`/tasks/${id}`);
      });

      if (req.files && req.files.file) {
        const file = req.files.file as UploadedFile;

        file.mv(`./${config.staticDir}/${file.name.replace(' ', '_')}`, (error) => {
          if (error) {
            return res.status(500).send(error);
          }

          statement.run(vars);
        });
      } else {
        statement.run(vars);
      }
    });

    server.post('/api/admin/delete', adminBridge, (req, res) => {
      const { id } = req.body;

      db.serialize(() => {
        db.run('DELETE FROM stask WHERE task_id=(?)', id);

        db.run('DELETE FROM task WHERE task_id=(?)', id, (error) => {
          if (error) {
            console.log(error);
          }

          res.redirect('/tasks');
        });
      });
    });

    server.post('/api/submit', authBridge, startMatchBridge, endMatchBridge, (req, res) => {
      const taskId = parseInt(req.body.task_id, 10);
      const userId = (req.user as User).id;
      const userName = (req.user as User).name;
      const flag = req.body.task_flag.trim().replace('\n', '');

      const statement = db.prepare('SELECT * from task WHERE task_id=(?) AND task_flag=(?)');
      statement.get(taskId, flag, (_, task) => {
        if (!task) {
          req.flash('error', 'Flag is invalid');
          history.makeLog(`${userName} has submitted WRONG flag`, { userId, taskId, flag });
          return res.redirect(req.headers.referer || '/');
        }

        const currentDate: number = moment().valueOf();
        db.run('INSERT INTO stask (stask_date, task_id, user_id) VALUES (?, ?, ?)', currentDate, taskId, userId, () => {
          req.flash('message', 'Flag was submitted!');
          history.makeLog(`${userName} has solved a task!`, { userId, taskId });
          return res.redirect(req.headers.referer || '/');
        });
      });
    });

    server.post('/api/posts', (_, res) => {
      db.all('SELECT * FROM post ORDER BY post_date DESC', (_, posts) => {
        res.json({ posts });
      });
    });

    server.post('/api/users', (_, res) => {
      db.all('SELECT u.user_id, u.user_name, SUM(t.task_points) '
        + 'FROM user AS u LEFT JOIN stask AS s ON s.user_id = u.user_id '
        + 'LEFT JOIN task AS t ON s.task_id = t.task_id '
        + 'WHERE u.user_admin = 0 '
        + 'GROUP BY u.user_id ORDER BY SUM(t.task_points) DESC, SUM(s.stask_date) ASC',
      (_, users) => {
        const newUsers: User[] = users.map((user) => {
          const readyUser: User = {
            id: user.user_id,
            name: user.user_name,
            points: user['SUM(t.task_points)'] || 0,
          };

          return readyUser;
        });
        res.json({ users: newUsers });
      });
    });

    server.post('/api/tasks', authBridge, startMatchBridge, (req, res) => {
      const { id } = req.user as User;

      db.all('SELECT t.task_id, t.task_name, t.task_content, '
        + 't.task_points, t.task_file, t.category_id, c.category_name, s.stask_id FROM task AS t '
        + 'JOIN category AS c ON c.category_id = t.category_id '
        + 'LEFT JOIN stask AS s ON s.task_id = t.task_id AND s.user_id = (?)',
      id, (_, tasks) => {
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

        db.all('SELECT * FROM category', (_, categories) => {
          const compiledCategories: Category[] = [];

          categories.forEach((category) => {
            const compiledCategory: Category = {
              id: category.category_id,
              name: category.category_name,
            };
            compiledCategories.push(compiledCategory);
          });

          res.json({ tasks: compiledTasks, categories: compiledCategories });
        });
      });
    });

    server.post('/api/tasks/:taskId', authBridge, startMatchBridge, (req, res) => {
      const { taskId } = req.params;
      const { id } = req.user as User;

      const statement = db.prepare('SELECT t.task_id, t.task_name, t.task_content, '
        + 't.task_points, t.task_file, t.category_id, c.category_name, s.stask_id FROM task AS t '
        + 'JOIN category AS c ON c.category_id = t.category_id '
        + 'LEFT JOIN stask AS s ON s.task_id = t.task_id AND s.user_id = (?) '
        + 'WHERE t.task_id = (?)');
      statement.get(id, taskId, (_, task) => {
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

        db.all('SELECT * FROM category', (_, categories) => {
          const compiledCategories: Category[] = [];

          categories.forEach((category) => {
            const compiledCategory: Category = {
              id: category.category_id,
              name: category.category_name,
            };
            compiledCategories.push(compiledCategory);
          });

          res.json({ task: compiledTask, categories: compiledCategories });
        });
      });
    });

    server.post('/login', noAuthBridge, passport.authenticate('local', {
      successRedirect: '/tasks',
      failureRedirect: '/login',
      failureFlash: true,
    }));

    server.post('/register', noAuthBridge, (req, res) => {
      const {
        username,
        email,
        password,
        password2
      } = req.body;

      if (password === password2) {
        const nameStatement = db.prepare('SELECT * FROM user WHERE user_name=(?)');
        const emailStatement = db.prepare('SELECT * FROM user WHERE user_email=(?)');
        const statement = db.prepare('INSERT INTO user ('
          + 'user_name, user_email, user_password) VALUES (?, ?, ?)');

        nameStatement.get(username, (_, existingUser) => {
          if (existingUser) {
            req.flash('error', 'User with this username already exists');
            return res.redirect('/register');
          }

          emailStatement.get(email, (_, existingUser2) => {
            if (existingUser2) {
              req.flash('error', 'User with this email already exists');
              return res.redirect('/register');
            }

            const hashPassword = pbkdf2.pbkdf2Sync(password, config.secret, 1, 32, 'sha512').toString('hex');
            statement.run([username, email, hashPassword], (error) => {
              if (error) {
                console.error('DB: Something wrong happened while was trying to register a new user');
                req.flash('error', 'Something goes wrong...');
                return res.redirect('/register');
              }

              nameStatement.get(username, (_, user) => {
                if (!user) {
                  console.error('DB: Something wrong happened in authorization of a new user');
                  req.flash('error', 'Something goes wrong...');
                  return res.redirect('/register');
                }

                req.login(user, (err) => {
                  if (!err) {
                    return res.redirect('/tasks');
                  }

                  console.error('DB: Something wrong happened in authorization of a new user');
                  req.flash('error', 'Something goes wrong...');
                  res.redirect('/register');
                });
              });
            });
          });
        });
      } else {
        req.flash('error', 'Passwords are not similar');
        res.redirect('/register');
      }
    });

    server.listen(config.port, (error) => {
      if (error) throw error;
      if (config.dateEnd.isBefore(config.dateStart)) {
        console.error('Change dateEnd and dateStart in config file.');
      }
      const host = config.hostname + (config.port ? `:${config.port}` : '');
      console.log(`> Ready on ${config.protocol}//${host}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
