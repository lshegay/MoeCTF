interface MyConfig {
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
  startMatchDate?: number;
  endMatchDate?: number;
}

interface MySecret {
  key: string;
  admin: {
    username: string;
    password: string;
    email: string;
  };
}

export type Config = Readonly<MyConfig>;
export type Secret = Readonly<MySecret>;
