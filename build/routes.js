"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const match_1 = __importDefault(require("./controllers/match"));
const user_1 = __importDefault(require("./controllers/user"));
const get_1 = __importDefault(require("./controllers/get"));
const admin_1 = __importDefault(require("./controllers/admin"));
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
        .all(user_1.default.is.authenticated, user_1.default.is.admin)
        .post(admin_1.default.creates.category(db, config));
    server.route('/api/admin/categories/:_id')
        .all(user_1.default.is.authenticated, user_1.default.is.admin)
        .delete(admin_1.default.deletes.category(db, config));
    server.route('/api/admin/posts')
        .all(user_1.default.is.authenticated, user_1.default.is.admin)
        .post(admin_1.default.creates.post(db, config));
    server.route('/api/admin/posts/:_id')
        .all(user_1.default.is.authenticated, user_1.default.is.admin)
        .delete(admin_1.default.deletes.post(db, config));
    server.route('/api/admin/tasks')
        .all(user_1.default.is.authenticated, user_1.default.is.admin)
        .post(admin_1.default.creates.task(db, config));
    server.route('/api/admin/tasks/:_id')
        .all(user_1.default.is.authenticated, user_1.default.is.admin)
        .put(admin_1.default.updates.task(db, config))
        .delete(admin_1.default.deletes.task(db, config));
    server.route('/api/users')
        .get(user_1.default.is.authenticated, get_1.default.users(db, config));
    server.route('/api/posts')
        .get(get_1.default.posts(db, config));
    server.route('/api/categories')
        .get(user_1.default.is.authenticated, match_1.default.is.started(db, config), get_1.default.categories(db, config));
    server.route('/api/tasks')
        .get(user_1.default.is.authenticated, match_1.default.is.started(db, config), get_1.default.tasks(db, config));
    server.route('/api/tasks/:_id')
        .get(user_1.default.is.authenticated, match_1.default.is.started(db, config), get_1.default.task(db, config));
    server.route('/api/submit')
        .post(user_1.default.is.authenticated, match_1.default.is.started(db, config), match_1.default.is.not.ended(db, config), user_1.default.submits(db, config));
    server.route('/api/login')
        .post(user_1.default.is.not.authenticated, user_1.default.logins(db, config));
    server.route('/api/logout')
        .get(user_1.default.is.authenticated, user_1.default.logouts);
    server.route('/api/register')
        .post(user_1.default.is.not.authenticated, user_1.default.registers(db, config));
    /** routes end */
};
exports.default = routes;
