import { Config, Database, User as MoeUser } from './src/models';

declare global {
  namespace Express {
    interface Request {
      db: Database;
      config: Config;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends MoeUser {}
  }
}
