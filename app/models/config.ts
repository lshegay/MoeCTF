export interface DatabaseNames {
  users: string;
  posts: string;
  tasks: string;
  categories: string;
  sessions: string;
}

export type Config = Readonly<{
  siteTitle: string;
  protocol: string;
  hostname: string;
  port: number;
  databaseDir: string;
  databaseNames: DatabaseNames;
  secure: boolean;
  cookiesAge: number;
  staticDir: string;
  logFileDir: string;
  timer: boolean;
  startMatchDate?: number;
  endMatchDate?: number;
}>;

export type Secret = Readonly<{
  key: string;
  admin: {
    username: string;
    password: string;
    email: string;
  };
}>;
