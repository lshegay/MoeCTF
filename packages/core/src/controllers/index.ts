import { Config, Database } from 'src/models';
import matchControllers from './match';
import userControllers from './user';
import getControllers from './get';
import adminControllers from './admin';

const release = (db: Database, config: Config) => {
  const match = matchControllers(db, config);
  const user = userControllers(db, config);
  const get = getControllers(db, config);
  const admin = adminControllers(db, config);

  return { match, user, get, admin };
};

export default release;
