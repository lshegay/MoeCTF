import { Moment } from 'moment';
import { RequestHandler } from 'express';

interface Config {
  siteTitle: string;
  protocol: string;
  hostname: string;
  port: number;
  database: string;
  databaseSessions: string;
  secret: string;
  secure: boolean;
  cookiesAge: number;
  staticDir: string;
  logFileDir: string;
  timer: boolean;
  startMatchDate?: Moment;
  endMatchDate?: Moment;

  plugins: {
    launcher: (options?) => RequestHandler;
    params: (options) => any;
  }[];
}

export default Config;
