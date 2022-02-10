export interface DatabaseNames {
  users: string;
  posts: string;
  tasks: string;
  sessions: string;
  cache: string;
}

export type RouteNames = Readonly<{
  adminUsersGet?: string;
  postsPost?: string;
  postPut?: string;
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
}>

export type Config = Readonly<{
  dev: boolean;
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
  maxPoints?: number;
  minPoints?: number;

  routes: RouteNames;

  secret: string;
  adminCreditals: {
    username: string;
    password: string;
    email: string;
  };
  createAdminUser?: boolean;
}>
