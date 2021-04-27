export interface DatabaseNames {
  users: string;
  posts: string;
  tasks: string;
  categories: string;
  sessions: string;
}

export type Config = Readonly<{
  protocol: string;
  hostname: string;
  port: number;
  databaseDir: string;
  databaseNames: DatabaseNames;
  secure: boolean;
  cookiesAge: number;
  staticDir: string;
  logFileDir: string;
  logFileName: string;
  timer: boolean;
  startMatchDate?: number;
  endMatchDate?: number;
  serveStaticDir: boolean;
  domain?: string;

  secret: string;
  adminCreditals: {
    username: string;
    password: string;
    email: string;
  };
  createAdminUser?: boolean;
}>;
