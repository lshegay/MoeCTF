import { Config } from '../app/models/config';

const config: Config = {
  siteTitle: 'MoeCTF',
  secure: false,
  protocol: 'http:',
  hostname: 'localhost',
  port: 3000,
  databaseDir: 'database',
  databaseNames: {
    users: 'users.db',
    posts: 'posts.db',
    tasks: 'tasks.db',
    categories: 'categories.db',
    sessions: 'sessions.db'
  },
  cookiesAge: 1000 * 60 * 60 * 24 * 30,
  staticDir: 'public/static',
  logFileDir: 'logs.txt',
  timer: true,
  startMatchDate: new Date(2020, 1, 29, 18, 11, 0).getTime(),
  endMatchDate: new Date(2021, 11, 5, 18, 0, 0).getTime(),

  secret: 'secret_gay_key',
  adminCreditals: {
    username: 'moe_admin',
    password: 'another_bruh_password',
    email: '',
  },
};

export default config;
