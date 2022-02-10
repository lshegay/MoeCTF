import { Moe } from './models/moe';
import { match, user, get, admin } from './controllers';

const routes = ({ server, db, config }: Moe): void => {
  if (config.routes.adminUsersGet) {
    server.route(config.routes.adminUsersGet)
      .all(user.is.authenticated, user.is.admin)
      .get(admin.gets.users(db, config));
  }

  if (config.routes.postsPost) {
    server.route(config.routes.postsPost)
      .all(user.is.authenticated, user.is.admin)
      .post(admin.creates.post(db, config));
  }

  if (config.routes.postPut) {
    server.route(config.routes.postPut)
      .all(user.is.authenticated, user.is.admin)
      .put(admin.updates.post(db, config));
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
};

export default routes;
