import express from 'express';
import session from 'express-session';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import nextjs from 'next';
import path from 'path';
import sqlite3Original from 'sqlite3';
import connectSQLite3 from 'connect-sqlite3';
import crypto from 'crypto';

import routes from './routes';
import config from './settings/config';
import secret from './settings/secret';
import { DBUser } from './models/db';

const sqlite3 = sqlite3Original.verbose();
const SQLiteStore = connectSQLite3(session);
const dev = process.env.NODE_ENV !== 'production';
const app = nextjs({ dev });
const handle = app.getRequestHandler();
const db = new sqlite3.Database(
  path.resolve('./', config.database),
  (error): void => { if (error) throw error; }
);

const host = config.hostname + (config.port ? `:${config.port}` : '');
const domain = `${config.protocol}//${host}`;

if (config.timer
  && config.endMatchDate
  && config.startMatchDate
  && config.endMatchDate <= config.startMatchDate) {
  throw new Error('Change endMatchDate and startMatchDate in config file.');
}

app.prepare()
  .then(() => {
    const server = express();

    server.use(express.static(path.resolve('./', config.staticDir)))
      .use(bodyParser.urlencoded({ extended: true }))
      .use(bodyParser.json())
      .use(session({
        secret: secret.key,
        resave: false,
        saveUninitialized: true,
        store: new SQLiteStore({
          db: path.join('./', config.databaseSessions),
        }),
        cookie: {
          secure: config.secure,
          maxAge: config.cookiesAge,
        },
      }))
      .use(fileUpload())
      .use(flash())
      .use(passport.initialize())
      .use(passport.session());

    passport.use(new LocalStrategy.Strategy({
      usernameField: 'username',
      passwordField: 'password',
      session: true,
    }, (name, password, done): void => {
      db.get('SELECT * FROM user WHERE user_name=(?)', name, (error: Error, user: DBUser) => {
        if (error) {
          return done(error);
        }

        const passHash = crypto.pbkdf2Sync(password, secret.key, 1, 32, 'sha512').toString('hex');
        if (user?.user_password == passHash) {
          return done(false, user);
        }

        return done(null, false, { message: 'Incorrect Creditals' });
      });
    }));

    passport.serializeUser((user: DBUser, done) => done(null, user.user_id));
    passport.deserializeUser((id, done) => {
      db.get('SELECT u.*, SUM(t.task_points) '
      + 'FROM user AS u LEFT JOIN stask AS s ON s.user_id = u.user_id '
      + 'LEFT JOIN task AS t ON s.task_id = t.task_id '
      + 'WHERE u.user_id = (?)',
      id, (error: Error, user: DBUser) => {
        if (error) {
          return done(error);
        }

        if (user) {
          const compiledUser = {
            id: user.user_id,
            name: user.user_name,
            content: user.user_content,
            admin: user.user_admin,
            email: user.user_email,
            avatar: user.user_avatar,
            points: user['SUM(t.task_points)'] ?? 0,
          };

          return done(null, compiledUser);
        }

        return done(null, false);
      });
    });

    routes(server, db, handle);

    server.listen(config.port, (error) => {
      if (error) throw error;
      console.log(`> Ready on ${domain}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
