import moment from 'moment';
import coins from '../plugins/coins';
import Config from '../../src/models/config';

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
  logFileDir: 'logs/log.txt',
  timer: true,
  startMatchDate: moment('2019-10-01 00:00:00'),
  endMatchDate: moment('2019-11-01 18:00:00'),

  plugins: [
    {
      launcher: coins,
      params: {
        userCash: 100,
      },
    }
  ],
};

export default config;
