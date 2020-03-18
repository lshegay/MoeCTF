import express, { Express } from 'express';
import session from 'express-session';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import passport from 'passport';
import path from 'path';
import Datastore from 'nedb';
import nedbSession from 'nedb-session-store';
import { User } from './models/units';
import { MoeParams } from './models/moe';
import routes from './routes';
import { Database } from './models/database';
import { Config } from './models/config';

const NedbSessionStore = nedbSession(session);

const start = (server: Express, config: Config): MoeParams => {
  if (!server) throw new Error('server has to be not null or undefined');

  const db: Database = {
    users: new Datastore({ filename: path.join('./', config.databaseDir, config.databaseNames.users), autoload: true }),
    posts: new Datastore({ filename: path.join('./', config.databaseDir, config.databaseNames.posts), autoload: true }),
    tasks: new Datastore({ filename: path.join('./', config.databaseDir, config.databaseNames.tasks), autoload: true }),
    categories: new Datastore({ filename: path.join('./', config.databaseDir, config.databaseNames.categories), autoload: true }),
  };
  const moe: MoeParams = { server, db, config };

  if (config.timer
    && config.endMatchDate
    && config.startMatchDate
    && config.endMatchDate <= config.startMatchDate) {
    throw new Error('Change endMatchDate and startMatchDate in config file');
  }

  server
    .use(express.static(path.resolve('./', config.staticDir)))
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(session({
      secret: config.secret,
      resave: false,
      saveUninitialized: false,
      store: new NedbSessionStore({ filename: path.join('./', config.databaseDir, config.databaseNames.sessions) }),
      cookie: {
        secure: config.secure,
        maxAge: config.cookiesAge,
      },
    }))
    .use(fileUpload())
    .use(passport.initialize())
    .use(passport.session());

  passport.serializeUser((user: User, done) => done(null, user._id));
  passport.deserializeUser((_id, done) => {
    db.users.findOne({ _id }, { password: 0 }, (error: Error, user: any) => {
      if (error) return done(error);
      if (user) return done(null, user);
      return done(null, false);
    });
  });

  routes(moe);
  return moe;
};

export default start;
