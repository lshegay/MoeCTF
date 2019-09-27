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
};

export default config;
