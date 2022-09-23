import { Moe } from './models/moe';
import controllers from './controllers';

const attachRoutes = ({ server, db, config }: Moe): void => {
  const { match, user, get, admin } = controllers(db, config);

  if (config.routes.postsPost) {
    server
      .route(config.routes.postsPost)
      .all(user.is.authenticated, user.is.admin)
      .post(admin.creates.post);
  }

  if (config.routes.postPut) {
    server
      .route(config.routes.postPut)
      .all(user.is.authenticated, user.is.admin)
      .put(admin.updates.post);
  }

  if (config.routes.postDelete) {
    server
      .route(config.routes.postDelete)
      .all(user.is.authenticated, user.is.admin)
      .delete(admin.deletes.post);
  }

  if (config.routes.tasksPost) {
    server
      .route(config.routes.tasksPost)
      .all(user.is.authenticated, user.is.admin)
      .post(admin.creates.task);
  }

  if (config.routes.taskPut) {
    server
      .route(config.routes.taskPut)
      .all(user.is.authenticated, user.is.admin)
      .put(admin.updates.task);
  }

  if (config.routes.taskDelete) {
    server
      .route(config.routes.taskDelete)
      .all(user.is.authenticated, user.is.admin)
      .delete(admin.deletes.task);
  }

  if (config.routes.usersGet) {
    server.route(config.routes.usersGet).get(user.is.authenticated, get.users);
  }

  if (config.routes.adminUsersGet) {
    server
      .route(config.routes.adminUsersGet)
      .all(user.is.authenticated, user.is.admin)
      .get(admin.gets.users);
  }

  if (config.routes.userDelete) {
    server
      .route(config.routes.userDelete)
      .all(user.is.authenticated, user.is.admin)
      .delete(admin.deletes.user);
  }

  if (config.routes.profileGet) {
    server
      .route(config.routes.profileGet)
      .get(user.is.authenticated, get.profile);
  }

  if (config.routes.postsGet) {
    server.route(config.routes.postsGet).get(get.posts);
  }

  if (config.routes.tasksGet) {
    server
      .route(config.routes.tasksGet)
      .get(user.is.authenticated, match.is.started, get.tasks);
  }

  if (config.routes.taskGet) {
    server
      .route(config.routes.taskGet)
      .get(user.is.authenticated, match.is.started, get.task);
  }

  if (config.routes.taskSubmit) {
    server
      .route(config.routes.taskSubmit)
      .post(
        user.is.authenticated,
        match.is.started,
        match.is.not.ended,
        user.submits,
      );
  }

  if (config.routes.login) {
    server
      .route(config.routes.login)
      .post(user.is.not.authenticated, user.logins);
  }

  if (config.routes.logout) {
    server.route(config.routes.logout).get(user.is.authenticated, user.logouts);
  }

  if (config.routes.register) {
    server
      .route(config.routes.register)
      .post(user.is.not.authenticated, user.registers);
  }
};

export default attachRoutes;
