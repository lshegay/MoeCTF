
import { Express } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { UrlWithParsedQuery } from 'url';
import { Database } from 'sqlite3';

import match from './controllers/match';
import user from './controllers/user';
import post from './controllers/post';
import task from './controllers/task';
import admin from './controllers/admin';
import { logout, register, login } from './controllers/auth';

interface RoutesParams {
  server: Express;
  db: Database;
  nextHandler:
    (req: IncomingMessage, res: ServerResponse, parsedUrl?: UrlWithParsedQuery) => Promise<void>;
}

const routes = ({ server, db, nextHandler }: RoutesParams): void => {
  /** PAGES RULES start */
  server.get('/tasks', user.isAuthenticated, match.isStarted);
  server.get('/scoreboard', user.isAuthenticated);
  server.get('/profile', user.isAuthenticated);
  server.get('/logout', user.isAuthenticated, logout);
  server.get('/login', user.isNotAuthenticated);
  server.get('/register', user.isNotAuthenticated);
  /** PAGES RULES end */

  server.get('*', (req, res) => nextHandler(req, res));

  /** routes start */
  server.route('/api/admin/create/category')
    .post(user.isAdmin, admin.createCategory(db));

  server.route('/api/admin/delete/category')
    .post(user.isAdmin, admin.deleteCategory(db));

  server.route('/api/admin/create/post')
    .post(user.isAdmin, admin.createPost(db));

  server.route('/api/admin/delete/post')
    .post(user.isAdmin, admin.deletePost(db));

  server.route('/api/admin/create')
    .post(user.isAdmin, admin.createTask(db));

  server.route('/api/admin/update')
    .post(user.isAdmin, admin.updateTask(db));

  server.route('/api/admin/delete')
    .post(user.isAdmin, admin.deleteTask(db));

  server.route('/api/submit')
    .post(user.isAuthenticated, match.isStarted, match.isNotEnded, user.submit(db));

  server.route('/api/posts')
    .post(post.getAll(db));

  server.route('/api/users')
    .post(user.getAll(db));

  server.route('/api/tasks')
    .post(user.isAuthenticated, match.isStarted, task.getAll(db));

  server.route('/api/tasks/:taskId')
    .post(user.isAuthenticated, match.isStarted, task.getOne(db));

  server.route('/login')
    .post(user.isNotAuthenticated, login());

  server.route('/register')
    .post(user.isNotAuthenticated, register(db));
  /** routes end */
};

export default routes;
