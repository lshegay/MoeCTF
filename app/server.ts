import express from 'express';
import session from 'express-session';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import passport from 'passport';
import nextjs from 'next';
import path from 'path';
import Datastore from 'nedb';
import nedbSession from 'nedb-session-store';
import { Server as HttpServer } from 'http';
import Server from 'next/dist/next-server/server/next-server';

import { User } from './models/units';
import routes from './routes';
import { Database } from './models/database';
import config from './settings/config';
import secret from './settings/secret';

const NedbSessionStore = nedbSession(session);

const dev = process.env.NODE_ENV !== 'production';
const host = config.hostname + (config.port ? `:${config.port}` : '');
const domain = `${config.protocol}//${host}`;

const db: Database = {
  users: new Datastore({ filename: path.join('./', config.databaseDir, config.databaseNames.users), autoload: true }),
  posts: new Datastore({ filename: path.join('./', config.databaseDir, config.databaseNames.posts), autoload: true }),
  tasks: new Datastore({ filename: path.join('./', config.databaseDir, config.databaseNames.tasks), autoload: true }),
  categories: new Datastore({ filename: path.join('./', config.databaseDir, config.databaseNames.categories), autoload: true }),
};
const app = nextjs({ dev });
const nextHandler = app.getRequestHandler();
const server = express();

if (config.timer
  && config.endMatchDate
  && config.startMatchDate
  && config.endMatchDate <= config.startMatchDate) {
  throw new Error('Change endMatchDate and startMatchDate in config file');
}

let http: HttpServer;

const nextApp = app.prepare()
  .then(() => {
    server.use(express.static(path.resolve('./', config.staticDir)))
      .use(bodyParser.urlencoded({ extended: true }))
      .use(bodyParser.json())
      .use(session({
        secret: secret.key,
        resave: false,
        saveUninitialized: false,
        store: new NedbSessionStore({ filename: path.join('./', config.databaseDir, config.databaseNames.sessions) }),
        cookie: {
          secure: config.secure,
          maxAge: config.cookiesAge,
        },
      }))
      .use(fileUpload())
      .use(flash())
      .use(passport.initialize())
      .use(passport.session());

    passport.serializeUser((user: User, done) => done(null, user._id));
    passport.deserializeUser((_id, done) => {
      db.users.findOne({ _id }, { password: 0 }, (error: Error, user: any) => {
        if (error) {
          return done(error);
        }

        if (user) {
          return done(null, user);
        }

        return done(null, false);
      });
    });

    routes({ server, db, nextHandler });

    http = server.listen({
      host: config.hostname,
      port: config.port,
      exclusive: true,
    }, () => {
      console.log(`> Ready on ${domain}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });

/**
 * This was made for tests
 * @returns a promise which calls callback after Next App is ready to go
 */
const prepared: Promise<{ http: HttpServer; app: Server }> = new Promise((resolve) => {
  nextApp.then(() => {
    resolve({ http, app });
  });
});

export { db, prepared };
