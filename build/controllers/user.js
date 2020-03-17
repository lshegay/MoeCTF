"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const log_1 = __importDefault(require("../utils/log"));
const response_1 = __importStar(require("../utils/response"));
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json(response_1.default.fail({}, 'User should be authenticated'));
};
const isNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.status(403).json(response_1.default.fail({}, 'User is authenticated already'));
};
const isAdmin = (req, res, next) => {
    if (req.user.admin) {
        return next();
    }
    res.status(403).json(response_1.default.fail({}, 'User does not have enough privileges to do this'));
};
/** AUTHORIZATION HANDLERS START */
const login = (db, config) => async (req, res) => {
    const { name, password, } = req.body;
    if (!name || !password) {
        res.status(400).json(response_1.default.fail(response_1.projection({
            name: 'A name is required',
            password: 'A password is required',
        }, { name, password })));
        return;
    }
    db.users.findOne({ name }, (error, user) => {
        if (error) {
            res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
            throw error;
        }
        if (user) {
            const passHash = crypto_1.default.pbkdf2Sync(password, config.secret, 1, 32, 'sha512').toString('hex');
            if ((user === null || user === void 0 ? void 0 : user.password) == passHash) {
                req.login(user, (error) => {
                    if (error) {
                        res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
                        throw error;
                    }
                    const resUser = {
                        ...user,
                        password,
                    };
                    res.status(200).json(response_1.default.success({ user: resUser }));
                });
            }
            else {
                res.status(401).json(response_1.default.fail({}, 'Incorrect Creditals'));
            }
        }
        else {
            res.status(401).json(response_1.default.fail({}, 'Incorrect Creditals'));
        }
    });
};
const logout = (req, res) => {
    req.logout();
    res.status(200).json(response_1.default.success());
};
const register = (db, config) => async (req, res) => {
    const { name, email, password, password2 } = req.body;
    if (!name || !email || !password || !password2) {
        res.status(400).json(response_1.default.fail(response_1.projection({
            name: 'A name is required',
            email: 'An email is required',
            password: 'A password is required',
            password2: 'A password2 is required',
        }, { name, email, password, password2 })));
        return;
    }
    if (password != password2) {
        res.status(401).json(response_1.default.fail({}, 'Passwords are required to be identical'));
        return;
    }
    db.users.findOne({ $or: [{ name }, { email }] }, (error, user) => {
        if (error) {
            res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
            throw error;
        }
        if (user) {
            res.status(401).json(response_1.default.fail({}, 'User with this creditals already exists'));
            return;
        }
        const derviedKey = crypto_1.default.pbkdf2Sync(password, config.secret, 1, 32, 'sha512').toString('hex');
        db.users.insert({ name, email, password: derviedKey }, (error, user) => {
            if (error) {
                res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
                throw error;
            }
            req.login(user, (error) => {
                if (error) {
                    res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
                    throw error;
                }
                const resUser = {
                    ...user,
                    password,
                };
                res.status(201).json(response_1.default.success({ user: resUser }));
            });
        });
    });
};
/** AUTHORIZATION HANDLERS END */
const taskSubmit = (db, config) => (req, res) => {
    const { taskId } = req.body;
    const flag = req.body.flag.trim().replace('\n', '');
    const user = req.user;
    const userId = user._id;
    if (!taskId || !flag) {
        console.log(flag);
        res.status(400).json(response_1.default.fail(response_1.projection({
            taskId: 'A taskId is required',
            flag: 'An flag is required',
        }, { taskId, flag })));
        return;
    }
    db.tasks.findOne({ _id: taskId }, (error, task) => {
        var _a;
        if (error) {
            res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
            throw error;
        }
        if (!task) {
            res.status(404).json(response_1.default.error(`Task with ${taskId} id is not exist`));
            return;
        }
        if ((_a = task.solved) === null || _a === void 0 ? void 0 : _a.find((solved) => solved.userId == userId)) {
            res.status(409).json(response_1.default.error(`Task with ${taskId} id already has been solved`));
            log_1.default(path_1.default.resolve('./', config.logFileDir), `${user.name} tries to submit a flag on completed task`, { userId, taskId });
            return;
        }
        if (task.flag != flag) {
            res.status(200).json(response_1.default.success({ message: 'Flag is invalid' }));
            log_1.default(path_1.default.resolve('./', config.logFileDir), `${user.name} has submitted a WRONG flag`, { userId, taskId, flag });
            return;
        }
        const date = Date.now();
        db.tasks.update({ _id: task.id }, { $push: { solved: { userId, date } } }, { returnUpdatedDocs: true, multi: false }, (error) => {
            if (error) {
                res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
                throw error;
            }
            log_1.default(path_1.default.resolve('./', config.logFileDir), `${user.name} has solved a task!`, { userId, taskId });
            res.status(200).json(response_1.default.success({ date }));
        });
    });
};
exports.default = {
    is: {
        authenticated: isAuthenticated,
        admin: isAdmin,
        not: {
            authenticated: isNotAuthenticated,
        }
    },
    submits: taskSubmit,
    logins: login,
    logouts: logout,
    registers: register,
};
