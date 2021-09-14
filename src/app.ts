import { urlencoded, json } from 'body-parser';
import crypto from 'crypto';
import express, { Express } from 'express';
import fileUpload from 'express-fileupload';
import session from 'express-session';
import defaultsDeep from 'lodash/defaultsDeep';
import Datastore from 'nedb';
import nedbSession from 'nedb-session-store';
import passport from 'passport';
import path from 'path';
import { Category, Config, Database, DatabaseNames, Moe, Post, Task, Unit, User } from './models';
import routes from './routes';
import * as workers from './workers';
import request from './utils/request';
import response from './utils/response';

const CONFIG_DEFAULTS: Config = {
  protocol: 'http:',
  hostname: 'localhost',
  port: 3000,
  secure: false,
  databaseDir: 'database',
  databaseNames: {
    users: 'users.db',
    posts: 'posts.db',
    tasks: 'tasks.db',
    categories: 'categories.db',
    sessions: 'sessions.db',
  },
  cookiesAge: 1000 * 60 * 60 * 24 * 30,
  staticDir: 'public/static',
  logFileName: 'logs.txt',
  logFileDir: '',
  timer: false,
  serveStaticDir: true,
  domain: 'http://localhost:3000',

  secret: 'secret_moe_moe_key',
  adminCreditals: {
    username: 'moe_admin',
    password: 'moe_moe_password',
    email: '',
  },
  createAdminUser: true,

  routes: {
    categoriesPost: '/api/admin/categories',
    categoryDelete: '/api/admin/categories/:_id',
    postsPost: '/api/admin/posts',
    postDelete: '/api/admin/posts/:_id',
    tasksPost: '/api/admin/tasks',
    taskPut: '/api/admin/tasks/:_id',
    taskDelete: '/api/admin/tasks/:_id',
    usersGet: '/api/users',
    profileGet: '/api/profile',
    postsGet: '/api/posts',
    categoriesGet: '/api/categories',
    tasksGet: '/api/tasks',
    taskGet: '/api/tasks/:_id',
    taskSubmit: '/api/submit',
    login: '/api/login',
    logout: '/api/logout',
    register: '/api/register',
  }
};

const start = (server: Express, _db?: Database, options: Partial<Config> = {}): Moe => {
  if (!server) throw new Error('server has to be not null or undefined');
  const config: Config = defaultsDeep(options, CONFIG_DEFAULTS);
  const NedbSessionStore = nedbSession(session);
  const db: Database = _db ?? {
    users: new Datastore({ filename: path.join('./', config.databaseDir, config.databaseNames.users), autoload: true }),
    posts: new Datastore({ filename: path.join('./', config.databaseDir, config.databaseNames.posts), autoload: true }),
    tasks: new Datastore({ filename: path.join('./', config.databaseDir, config.databaseNames.tasks), autoload: true }),
    categories: new Datastore({ filename: path.join('./', config.databaseDir, config.databaseNames.categories), autoload: true }),
  };
  const moe: Moe = { server, db, config };

  if (config.createAdminUser) {
    db.users.findOne({ name: config.adminCreditals.username }, (error, user) => {
      if (error) throw error;

      if (!user) {
        db.users.insert({
          name: config.adminCreditals.username,
          password: crypto.pbkdf2Sync(config.adminCreditals.password, config.secret, 1, 32, 'sha512').toString('hex'),
          email: config.adminCreditals.email,
          admin: true,
          avatar: null,
          content: null,
        });
      }
    });
  }

  if (config.timer
    && config.endMatchDate
    && config.startMatchDate
    && config.endMatchDate <= config.startMatchDate) {
    throw new Error('Change endMatchDate and startMatchDate in config file');
  }

  if (config.serveStaticDir) server.use(express.static(path.resolve('./', config.staticDir)));

  server
    .use(urlencoded({ extended: true }))
    .use(json())
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

export {
  Config,
  DatabaseNames,
  Database,
  Moe,
  Category,
  Post,
  Task,
  User,
  Unit,
  CONFIG_DEFAULTS,

  workers,
  request,
  response,
};
