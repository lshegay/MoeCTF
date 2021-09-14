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
  if (config.routes.categoriesPost) {
    server.route(config.routes.categoriesPost)
      .all(user.is.authenticated, user.is.admin)
      .post(admin.creates.category(db, config));
  }

  if (config.routes.categoryDelete) {
    server.route(config.routes.categoryDelete)
      .all(user.is.authenticated, user.is.admin)
      .delete(admin.deletes.category(db, config));
  }

  if (config.routes.postsPost) {
    server.route(config.routes.postsPost)
      .all(user.is.authenticated, user.is.admin)
      .post(admin.creates.post(db, config));
  }

  if (config.routes.postDelete) {
    server.route(config.routes.postDelete)
      .all(user.is.authenticated, user.is.admin)
      .delete(admin.deletes.post(db, config));
  }

  if (config.routes.tasksPost) {
    server.route(config.routes.tasksPost)
      .all(user.is.authenticated, user.is.admin)
      .post(admin.creates.task(db, config));
  }

  if (config.routes.taskPut) {
    server.route(config.routes.taskPut)
      .all(user.is.authenticated, user.is.admin)
      .put(admin.updates.task(db, config));
  }

  if (config.routes.taskDelete) {
    server.route(config.routes.taskDelete)
      .all(user.is.authenticated, user.is.admin)
      .delete(admin.deletes.task(db, config));
  }

  if (config.routes.usersGet) {
    server.route(config.routes.usersGet)
      .get(user.is.authenticated, get.users(db, config));
  }

  if (config.routes.profileGet) {
    server.route(config.routes.profileGet)
      .get(user.is.authenticated, get.profile(db, config));
  }

  if (config.routes.postsGet) {
    server.route(config.routes.postsGet)
      .get(get.posts(db, config));
  }

  if (config.routes.categoriesGet) {
    server.route(config.routes.categoriesGet)
      .get(user.is.authenticated, match.is.started(db, config), get.categories(db, config));
  }

  if (config.routes.tasksGet) {
    server.route(config.routes.tasksGet)
      .get(user.is.authenticated, match.is.started(db, config), get.tasks(db, config));
  }

  if (config.routes.taskGet) {
    server.route(config.routes.taskGet)
      .get(user.is.authenticated, match.is.started(db, config), get.task(db, config));
  }

  if (config.routes.taskSubmit) {
    server.route(config.routes.taskSubmit)
      .post(
        user.is.authenticated,
        match.is.started(db, config),
        match.is.not.ended(db, config),
        user.submits(db, config)
      );
  }

  if (config.routes.login) {
    server.route(config.routes.login)
      .post(user.is.not.authenticated, user.logins(db, config));
  }

  if (config.routes.logout) {
    server.route(config.routes.logout)
      .get(user.is.authenticated, user.logouts);
  }

  if (config.routes.register) {
    server.route(config.routes.register)
      .post(user.is.not.authenticated, user.registers(db, config));
  }

  if (config.routes.register) {
    server.route(config.routes.register)
      .post(user.is.not.authenticated, user.registers(db, config));
  }
  /** routes end */
};

export default routes;
