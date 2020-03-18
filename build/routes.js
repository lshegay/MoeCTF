"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controllers_1 = require("./controllers");
const routes = ({ server, db, config }) => {
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
        .all(controllers_1.user.is.authenticated, controllers_1.user.is.admin)
        .post(controllers_1.admin.creates.category(db, config));
    server.route('/api/admin/categories/:_id')
        .all(controllers_1.user.is.authenticated, controllers_1.user.is.admin)
        .delete(controllers_1.admin.deletes.category(db, config));
    server.route('/api/admin/posts')
        .all(controllers_1.user.is.authenticated, controllers_1.user.is.admin)
        .post(controllers_1.admin.creates.post(db, config));
    server.route('/api/admin/posts/:_id')
        .all(controllers_1.user.is.authenticated, controllers_1.user.is.admin)
        .delete(controllers_1.admin.deletes.post(db, config));
    server.route('/api/admin/tasks')
        .all(controllers_1.user.is.authenticated, controllers_1.user.is.admin)
        .post(controllers_1.admin.creates.task(db, config));
    server.route('/api/admin/tasks/:_id')
        .all(controllers_1.user.is.authenticated, controllers_1.user.is.admin)
        .put(controllers_1.admin.updates.task(db, config))
        .delete(controllers_1.admin.deletes.task(db, config));
    server.route('/api/users')
        .get(controllers_1.user.is.authenticated, controllers_1.get.users(db, config));
    server.route('/api/posts')
        .get(controllers_1.get.posts(db, config));
    server.route('/api/categories')
        .get(controllers_1.user.is.authenticated, controllers_1.match.is.started(db, config), controllers_1.get.categories(db, config));
    server.route('/api/tasks')
        .get(controllers_1.user.is.authenticated, controllers_1.match.is.started(db, config), controllers_1.get.tasks(db, config));
    server.route('/api/tasks/:_id')
        .get(controllers_1.user.is.authenticated, controllers_1.match.is.started(db, config), controllers_1.get.task(db, config));
    server.route('/api/submit')
        .post(controllers_1.user.is.authenticated, controllers_1.match.is.started(db, config), controllers_1.match.is.not.ended(db, config), controllers_1.user.submits(db, config));
    server.route('/api/login')
        .post(controllers_1.user.is.not.authenticated, controllers_1.user.logins(db, config));
    server.route('/api/logout')
        .get(controllers_1.user.is.authenticated, controllers_1.user.logouts);
    server.route('/api/register')
        .post(controllers_1.user.is.not.authenticated, controllers_1.user.registers(db, config));
    /** routes end */
};
exports.default = routes;
//# sourceMappingURL=routes.js.map