import { Moe } from './models/moe';
import { match, user, get, admin } from './controllers';

const routes = ({ server, db, config }: Moe): void => {
  /** PAGES RULES start */
  /* server.get('/tasks', user.is.authenticated, match.is.started);
  server.get('/tasks/:taskId', user.is.authenticated, match.is.started);
  server.get('/scoreboard', user.is.authenticated);
  server.get('/profile', user.is.authenticated);
  server.get('/login', user.is.not.authenticated);
  server.get('/register', user.is.not.authenticated); */
  /** PAGES RULES end */

  /** routes start */
  server.route('/api/admin/categories')
    .all(user.is.authenticated, user.is.admin)
    .post(admin.creates.category(db, config));

  server.route('/api/admin/categories/:_id')
    .all(user.is.authenticated, user.is.admin)
    .delete(admin.deletes.category(db, config));

  server.route('/api/admin/posts')
    .all(user.is.authenticated, user.is.admin)
    .post(admin.creates.post(db, config));

  server.route('/api/admin/posts/:_id')
    .all(user.is.authenticated, user.is.admin)
    .delete(admin.deletes.post(db, config));

  server.route('/api/admin/tasks')
    .all(user.is.authenticated, user.is.admin)
    .post(admin.creates.task(db, config));

  server.route('/api/admin/tasks/:_id')
    .all(user.is.authenticated, user.is.admin)
    .put(admin.updates.task(db, config))
    .delete(admin.deletes.task(db, config));

  server.route('/api/users')
    .get(user.is.authenticated, get.users(db, config));

  server.route('/api/profile')
    .get(user.is.authenticated, get.profile(db, config));

  server.route('/api/posts')
    .get(get.posts(db, config));

  server.route('/api/categories')
    .get(user.is.authenticated, match.is.started(db, config), get.categories(db, config));

  server.route('/api/tasks')
    .get(user.is.authenticated, match.is.started(db, config), get.tasks(db, config));

  server.route('/api/tasks/:_id')
    .get(user.is.authenticated, match.is.started(db, config), get.task(db, config));

  server.route('/api/submit')
    .post(
      user.is.authenticated,
      match.is.started(db, config),
      match.is.not.ended(db, config),
      user.submits(db, config)
    );

  server.route('/api/login')
    .post(user.is.not.authenticated, user.logins(db, config));

  server.route('/api/logout')
    .get(user.is.authenticated, user.logouts);

  // FAREASTCTF MODIFICATION
  // server.route('/api/register')
  //   .post(user.is.not.authenticated, user.registers(db, config));
  /** routes end */
};

export default routes;
