import { Config } from './models';

export const dev = process.env.NODE_ENV != 'production';

export const CONFIG_DEFAULTS: Config = {
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
    userDelete: '/admin/users/:_id',
    profileGet: '/profile',
    postsGet: '/posts',
    categoriesGet: '/categories',
    tasksGet: '/tasks',
    taskGet: '/tasks/:_id',
    taskSubmit: '/submit',
    login: '/login',
    logout: '/logout',
    register: '/register',
  },

  cors: [],
};
