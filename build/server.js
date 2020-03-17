"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const body_parser_1 = __importDefault(require("body-parser"));
const connect_flash_1 = __importDefault(require("connect-flash"));
const passport_1 = __importDefault(require("passport"));
const path_1 = __importDefault(require("path"));
const nedb_1 = __importDefault(require("nedb"));
const nedb_session_store_1 = __importDefault(require("nedb-session-store"));
const routes_1 = __importDefault(require("./routes"));
const NedbSessionStore = nedb_session_store_1.default(express_session_1.default);
const start = (config) => {
    const server = express_1.default();
    const db = {
        users: new nedb_1.default({ filename: path_1.default.join('./', config.databaseDir, config.databaseNames.users), autoload: true }),
        posts: new nedb_1.default({ filename: path_1.default.join('./', config.databaseDir, config.databaseNames.posts), autoload: true }),
        tasks: new nedb_1.default({ filename: path_1.default.join('./', config.databaseDir, config.databaseNames.tasks), autoload: true }),
        categories: new nedb_1.default({ filename: path_1.default.join('./', config.databaseDir, config.databaseNames.categories), autoload: true }),
    };
    const moe = { server, db, config };
    if (config.timer
        && config.endMatchDate
        && config.startMatchDate
        && config.endMatchDate <= config.startMatchDate) {
        throw new Error('Change endMatchDate and startMatchDate in config file');
    }
    server.use(express_1.default.static(path_1.default.resolve('./', config.staticDir)))
        .use(body_parser_1.default.urlencoded({ extended: true }))
        .use(body_parser_1.default.json())
        .use(express_session_1.default({
        secret: config.secret,
        resave: false,
        saveUninitialized: false,
        store: new NedbSessionStore({ filename: path_1.default.join('./', config.databaseDir, config.databaseNames.sessions) }),
        cookie: {
            secure: config.secure,
            maxAge: config.cookiesAge,
        },
    }))
        .use(express_fileupload_1.default())
        .use(connect_flash_1.default())
        .use(passport_1.default.initialize())
        .use(passport_1.default.session());
    passport_1.default.serializeUser((user, done) => done(null, user._id));
    passport_1.default.deserializeUser((_id, done) => {
        db.users.findOne({ _id }, { password: 0 }, (error, user) => {
            if (error) {
                return done(error);
            }
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        });
    });
    routes_1.default(moe);
    return moe;
};
exports.default = start;
