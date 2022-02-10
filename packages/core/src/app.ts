import { urlencoded, json } from 'body-parser';
import crypto from 'crypto';
import express, { Express } from 'express';
import fileUpload from 'express-fileupload';
import session from 'express-session';
import defaultsDeep from 'lodash/defaultsDeep';
import trimStart from 'lodash/trimStart';
import Datastore from 'nedb-promises';
import passport from 'passport';
import path from 'path';
import { Server } from 'http';
import makeStore from 'nedb-promises-session-store';
import { Config, Database, DatabaseNames, Moe, Post, Task, Unit, User } from './models';
import routes from './routes';
import request from './utils/request';
import response from './utils/response';

const dev = process.env.NODE_ENV != 'production';

const CONFIG_DEFAULTS: Config = {
  dev,
  protocol: 'http:',
  hostname: 'localhost',
  port: 4000,
  secure: false,
  databaseDir: 'database',
  databaseNames: {
    users: 'users.db',
    posts: 'posts.db',
    tasks: 'tasks.db',
    sessions: 'sessions.db',
    cache: 'cache.db',
  },
  cookiesAge: 1000 * 60 * 60 * 24 * 30,
  staticDir: 'files',
  logFileName: 'logs.txt',
  logFileDir: '',
  timer: false,
  serveStaticDir: true,
  domain: 'http://localhost:4000',
  dynamicPoints: true,
  maxPoints: 500,
  minPoints: 50,

  secret: 'secret_moe_moe_key',
  adminCreditals: {
    username: 'moe_admin',
    password: 'moe_moe_password',
    email: '',
  },
  createAdminUser: true,

  routes: {
    adminUsersGet: '/admin/users',
    postsPost: '/admin/posts',
    postPut: '/admin/posts/:_id',
    postDelete: '/admin/posts/:_id',
    tasksPost: '/admin/tasks',
    taskPut: '/admin/tasks/:_id',
    taskDelete: '/admin/tasks/:_id',
    usersGet: '/users',
    profileGet: '/profile',
    postsGet: '/posts',
    categoriesGet: '/categories',
    tasksGet: '/tasks',
    taskGet: '/tasks/:_id',
    taskSubmit: '/submit',
    login: '/login',
    logout: '/logout',
    register: '/register',
  }
};

const createMoe = (server: Express, db: Database, config: Config): Moe => ({
  server,
  db,
  config,
  listen: (callback): Server => (
    server.listen(config.port, config.hostname, () => {
      if (callback) callback(config);
      return server;
    })
  ),
});

const start = async (server: Express, _db?: Database, options?: Partial<Config>): Promise<Moe> => {
  if (!server) throw new Error('server has to be not null or undefined');
  const config: Config = defaultsDeep(options, CONFIG_DEFAULTS);
  const db: Database = _db ?? {
    users: Datastore.create({ filename: path.join('./', config.databaseDir, config.databaseNames.users), autoload: true, }),
    posts: Datastore.create({ filename: path.join('./', config.databaseDir, config.databaseNames.posts), autoload: true, }),
    tasks: Datastore.create({ filename: path.join('./', config.databaseDir, config.databaseNames.tasks), autoload: true, }),
    cache: Datastore.create({ filename: path.join('./', config.databaseDir, config.databaseNames.cache), autoload: true, }),
  };

  if (config.createAdminUser) {
    try {
      const adminUser: User = await db.users.findOne({ name: config.adminCreditals.username });

      if (!adminUser) {
        db.users.insert({
          name: config.adminCreditals.username,
          password: crypto.pbkdf2Sync(config.adminCreditals.password, config.secret, 1, 32, 'sha512').toString('hex'),
          email: config.adminCreditals.email,
          admin: true,
          avatar: null,
          content: null,
        });
      }
    } catch (error) {
      console.log(`Admin account was made unsuccefully due to error: "${error}"`);
    }
  }

  if (config.timer
    && config.endMatchDate
    && config.startMatchDate
    && config.endMatchDate <= config.startMatchDate) {
    throw new Error('Change endMatchDate and startMatchDate in config file');
  }
  if (config.serveStaticDir) server.use(`/${trimStart(config.staticDir, '/')}`, express.static(path.resolve('./', config.staticDir)));

  server
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(session({
      secret: config.secret,
      resave: false,
      saveUninitialized: false,
      store: makeStore({
        filename: path.join('./', config.databaseDir, config.databaseNames.sessions),
        connect: session,
      }),
      cookie: {
        secure: config.secure,
        maxAge: config.cookiesAge,
      },
    }))
    .use(fileUpload())
    .use(passport.initialize())
    .use(passport.session())
    .use((req: any, res, next) => {
      req.db = db;
      req.config = config;
      next();
    });

  passport.serializeUser((user, done) => done(null, (user as User)._id));
  passport.deserializeUser(async (_id: string, done) => {
    try {
      const user: User = await db.users.findOne({ _id });

      if (user) return done(null, user);
      done(null, false);
    } catch (error) {
      done(error);
    }
  });

  const moe: Moe = createMoe(server, db, config);

  routes(moe);
  return moe;
};

export default start;

export type {
  Config,
  DatabaseNames,
  Database,
  Moe,
  Post,
  Task,
  User,
  Unit,
};

export {
  CONFIG_DEFAULTS,

  request,
  response,
};
