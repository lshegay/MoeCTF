export interface DatabaseNames {
  users: string;
  posts: string;
  tasks: string;
  categories: string;
  sessions: string;
  cache: string;
}

export type RouteNames = Readonly<{
  categoriesPost?: string;
  categoryDelete?: string;
  postsPost?: string;
  postDelete?: string;
  tasksPost?: string;
  taskPut?: string;
  taskDelete?: string;
  usersGet?: string;
  profileGet?: string;
  postsGet?: string;
  categoriesGet?: string;
  tasksGet?: string;
  taskGet?: string;
  taskSubmit?: string;
  login?: string;
  logout?: string;
  register?: string;
}>;

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
  logAuthFileName?: string;
  timer: boolean;
  startMatchDate?: number;
  endMatchDate?: number;
  serveStaticDir: boolean;
  domain?: string;
  dynamicPoints?: boolean;
  minPoints?: number;

  routes: RouteNames;

  secret: string;
  adminCreditals: {
    username: string;
    password: string;
    email: string;
  };
  createAdminUser?: boolean;
}>;
