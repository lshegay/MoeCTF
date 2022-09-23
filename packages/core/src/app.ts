import { urlencoded, json } from 'body-parser';
import crypto from 'crypto';
import cors from 'cors';
import express, { Express } from 'express';
import fileUpload from 'express-fileupload';
import session from 'express-session';
import { Server } from 'http';
import { defaultsDeep, trimStart } from 'lodash';
import moment from 'moment';
import Datastore from 'nedb-promises';
import makeStore from 'nedb-promises-session-store';
import passport from 'passport';
import path from 'path';
import {
  Config,
  Database,
  DatabaseNames,
  Moe,
  Post,
  Task,
  Unit,
  User,
} from './models';
import attachRoutes from './routes';
import { CONFIG_DEFAULTS } from './config';
import request from './utils/request';
import response from './utils/response';

const createMoe = (server: Express, db: Database, config: Config): Moe => ({
  server,
  db,
  config,
  listen: (callback): Server =>
    server.listen(config.port, config.hostname, () => {
      if (callback) callback(config);
      return server;
    }),
});

const start = async (
  server: Express,
  _db?: Database,
  options?: Partial<Config>,
): Promise<Moe> => {
  if (!server) throw new Error('server has to be not null or undefined');
  const config = defaultsDeep(options, CONFIG_DEFAULTS) as Config;
  const db: Database = _db ?? {
    users: Datastore.create({
      filename: path.join('./', config.databaseDir, config.databaseNames.users),
      autoload: true,
    }),
    posts: Datastore.create({
      filename: path.join('./', config.databaseDir, config.databaseNames.posts),
      autoload: true,
    }),
    tasks: Datastore.create({
      filename: path.join('./', config.databaseDir, config.databaseNames.tasks),
      autoload: true,
    }),
    cache: Datastore.create({
      filename: path.join('./', config.databaseDir, config.databaseNames.cache),
      autoload: true,
    }),
  };

  if (config.createAdminUser) {
    try {
      const adminUser: User = await db.users.findOne({
        name: config.adminCreditals.username,
      });

      if (!adminUser) {
        await db.users.insert({
          name: config.adminCreditals.username,
          password: crypto
            .pbkdf2Sync(
              config.adminCreditals.password,
              config.secret,
              1,
              32,
              'sha512',
            )
            .toString('hex'),
          email: config.adminCreditals.email,
          admin: true,
          avatar: null,
          content: null,
        });
      }
    } catch (error) {
      console.log(
        `Admin account was made unsuccefully due to error: "${
          (error as Error).message
        }"`,
      );
    }
  }

  if (
    config.timer &&
    config.endMatchDate &&
    config.startMatchDate &&
    moment(config.endMatchDate).isSameOrBefore(config.startMatchDate)
  ) {
    throw new Error('Change endMatchDate and startMatchDate in config file');
  }
  if (config.serveStaticDir)
    server.use(
      `/${trimStart(config.staticDir, '/')}`,
      express.static(path.resolve('./', config.staticDir)),
    );

  server
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(
      cors({
        origin: config.cors,
        credentials: true,
      }),
    )
    .use(
      session({
        secret: config.secret,
        resave: false,
        saveUninitialized: false,
        store: makeStore({
          filename: path.join(
            './',
            config.databaseDir,
            config.databaseNames.sessions,
          ),
          connect: session,
        }),
        cookie: {
          secure: config.secure,
          maxAge: config.cookiesAge,
        },
      }),
    )
    .use(fileUpload())
    .use(passport.initialize())
    .use(passport.session())
    .use((req, _, next) => {
      req.db = db;
      req.config = config;
      next();
    });

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser((_id: string, done) => {
    try {
      db.users
        .findOne<User>({ _id })
        .then((user) => {
          if (user) return done(null, user);
          done(null, false);
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (error) {
      done(error);
    }
  });

  const moe: Moe = createMoe(server, db, config);

  attachRoutes(moe);
  return moe;
};

export default start;

export type { Config, DatabaseNames, Database, Moe, Post, Task, User, Unit };

export { CONFIG_DEFAULTS, request, response };
