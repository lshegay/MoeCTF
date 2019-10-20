import moment from 'moment';
import Config from '../interfaces/Config';

const config: Readonly<Config> = {
  siteTitle: 'MoeCTF',
  https: false,
  protocol: 'http:',
  hostname: 'localhost',
  port: 3000,
  database: './database.db',
  databaseSessions: './sessions.db',
  secret: 'secret_gay_key',
  cookiesAge: 1000 * 60 * 60 * 24 * 30,
  staticDir: 'static',
  logFileDir: './logs/log.txt',
  isTimer: true,
  dateStart: moment('2019-10-01 00:00:00'),
  dateEnd: moment('2019-11-01 18:00:00'),
};

export default config;
