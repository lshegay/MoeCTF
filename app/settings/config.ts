import Config from '../models/config';

const config: Readonly<Config> = {
  siteTitle: 'MoeCTF',
  secure: false,
  protocol: 'http:',
  hostname: 'localhost',
  port: 3000,
  database: 'database.db',
  databaseSessions: 'sessions.db',
  cookiesAge: 1000 * 60 * 60 * 24 * 30,
  staticDir: 'static',
  logFileDir: 'logs.txt',
  timer: true,
  startMatchDate: new Date(2020, 1, 29, 18, 11, 0).getTime(),
  endMatchDate: new Date(2021, 11, 5, 18, 0, 0).getTime(),
};

export default config;
