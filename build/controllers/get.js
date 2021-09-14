"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = __importDefault(require("../utils/response"));
const users = (db) => (_, res) => {
    db.users.find({}, { password: 0, email: 0 }, (error, users) => {
        if (error) {
            res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
            throw error;
        }
        res.status(200).json(response_1.default.success({ users }));
    });
};
const posts = (db) => (_, res) => {
    db.posts.find({}).sort({ date: 1 }).exec((error, posts) => {
        if (error) {
            res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
            throw error;
        }
        res.status(200).json(response_1.default.success({ posts }));
    });
};
const categories = (db) => (_, res) => {
    db.categories.find({}, (error, categories) => {
        if (error) {
            res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
            throw error;
        }
        res.status(200).json(response_1.default.success({ categories }));
    });
};
const tasks = (db) => (_, res) => {
    db.tasks.find({}, { flag: 0 }, (error, tasks) => {
        if (error) {
            res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
            throw error;
        }
        res.status(200).json(response_1.default.success({ tasks }));
    });
};
const task = (db) => (req, res) => {
    const { _id } = req.params;
    db.tasks.findOne({ _id }, { flag: 0 }, (error, task) => {
        if (error) {
            res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
            throw error;
        }
        res.status(200).json(response_1.default.success({ task }));
    });
};
exports.default = {
    users,
    posts,
    categories,
    tasks,
    task,
};
//# sourceMappingURL=get.js.map