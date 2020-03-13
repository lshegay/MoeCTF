import { RoutesParams } from './models/database';
import match from './controllers/match';
import user from './controllers/user';
import get from './controllers/get';
import admin from './controllers/admin';

const routes = ({ server, db, nextHandler }: RoutesParams): void => {
  /** PAGES RULES start */
  server.get('/tasks', user.is.authenticated, match.is.started);
  server.get('/tasks/:taskId', user.is.authenticated, match.is.started);
  server.get('/scoreboard', user.is.authenticated);
  server.get('/profile', user.is.authenticated);
  server.get('/login', user.is.not.authenticated);
  server.get('/register', user.is.not.authenticated);
  /** PAGES RULES end */

  /** routes start */
  server.route('/api/admin/categories')
    .all(user.is.authenticated, user.is.admin)
    .post(admin.creates.category(db));

  server.route('/api/admin/categories/:_id')
    .all(user.is.authenticated, user.is.admin)
    .delete(admin.deletes.category(db));

  server.route('/api/admin/posts')
    .all(user.is.authenticated, user.is.admin)
    .post(admin.creates.post(db));

  server.route('/api/admin/posts/:_id')
    .all(user.is.authenticated, user.is.admin)
    .delete(admin.deletes.post(db));

  server.route('/api/admin/tasks')
    .all(user.is.authenticated, user.is.admin)
    .post(admin.creates.task(db));

  server.route('/api/admin/tasks/:_id')
    .all(user.is.authenticated, user.is.admin)
    .put(admin.updates.task(db))
    .delete(admin.deletes.task(db));

  server.route('/api/users')
    .get(user.is.authenticated, get.users(db));

  server.route('/api/posts')
    .get(get.posts(db));

  server.route('/api/categories')
    .get(user.is.authenticated, match.is.started, get.categories(db));

  server.route('/api/tasks')
    .get(user.is.authenticated, match.is.started, get.tasks(db));

  server.route('/api/tasks/:_id')
    .get(user.is.authenticated, match.is.started, get.task(db));

  server.route('/api/submit')
    .post(user.is.authenticated, match.is.started, match.is.not.ended, user.submits(db));

  server.route('/api/login')
    .post(user.is.not.authenticated, user.logins(db));

  server.route('/api/logout')
    .get(user.is.authenticated, user.logouts);

  server.route('/api/register')
    .post(user.is.not.authenticated, user.registers(db));
  /** routes end */

  server.get('*', (req, res) => nextHandler(req, res));
};

export default routes;
