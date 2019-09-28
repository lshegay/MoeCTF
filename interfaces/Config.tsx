interface Config {
  siteTitle: string;
  protocol: string;
  hostname: string;
  port: number;
  database: string;
  databaseSessions: string;
  secret: string;
  https: boolean;
  cookiesAge: number;
  staticDir: string;
  logFileDir: string;
}

export default Config;
