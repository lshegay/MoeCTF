import { Moment } from 'moment';

interface Config {
  siteTitle: string;
  protocol: string;
  hostname: string;
  port: number;
  database: string;
  databaseSessions: string;
  secure: boolean;
  cookiesAge: number;
  staticDir: string;
  logFileDir: string;
  timer: boolean;
  startMatchDate?: Moment;
  endMatchDate?: Moment;

  plugins: {
    launcher: (options?) => void;
    params: object;
  }[];
}

export default Config;
