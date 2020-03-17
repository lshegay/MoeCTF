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
const fs_1 = __importDefault(require("fs"));
const pickBy_1 = __importDefault(require("lodash/pickBy"));
const response_1 = __importStar(require("../utils/response"));
const createCategory = (db) => (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400).json(response_1.default.fail({
            name: 'A name is required',
        }));
        return;
    }
    db.categories.insert({ name }, (error, category) => {
        if (error) {
            res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
            throw error;
        }
        res.status(201).json(response_1.default.success({ category }));
    });
};
const deleteCategory = (db) => (req, res) => {
    const { _id } = req.params;
    if (!_id) {
        res.status(400).json(response_1.default.fail({ _id: 'A query is required' }));
        return;
    }
    db.tasks.remove({ categoryId: _id }, { multi: true }, (error) => {
        if (error) {
            res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
            throw error;
        }
        db.categories.remove({ _id }, {}, (error, numRemoved) => {
            if (error) {
                res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
                throw error;
            }
            res.status(200).json(response_1.default.success({ numRemoved }));
        });
    });
};
const createPost = (db) => (req, res) => {
    const { name, content } = req.body;
    db.posts.insert({ name, content, date: Date.now() }, (error, post) => {
        if (error) {
            res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
            throw error;
        }
        res.status(201).json(response_1.default.success({ post }));
    });
};
const deletePost = (db) => (req, res) => {
    const { _id } = req.params;
    if (!_id) {
        res.status(400).json(response_1.default.fail({ _id: 'A query is required' }));
        return;
    }
    db.posts.remove({ _id }, {}, (error, numRemoved) => {
        if (error) {
            res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
            throw error;
        }
        res.status(200).json(response_1.default.success({ numRemoved }));
    });
};
const createTask = (db, config) => (req, res) => {
    var _a;
    const { name, content, flag, categoryId, } = req.body;
    const uploadedFile = (_a = req.files) === null || _a === void 0 ? void 0 : _a.file;
    if (!name || !req.body.points || !categoryId) {
        res.status(400).json(response_1.default.fail(response_1.projection({
            name: 'A name is required',
            points: 'Points is required',
            categoryId: 'A categoryId is required',
        }, { name, points: req.body.points, categoryId })));
        return;
    }
    const points = Number.parseInt(req.body.points, 10);
    if (!points) {
        res.status(400).json(response_1.default.fail({
            points: 'Points have to be number',
        }));
        return;
    }
    if (uploadedFile) {
        const file = `./${config.staticDir}/${uploadedFile.name.split(' ').join('_')}`;
        if (!fs_1.default.existsSync(`./${config.staticDir}`)) {
            fs_1.default.mkdirSync(`./${config.staticDir}`, { recursive: true });
        }
        uploadedFile.mv(file, (error) => {
            if (error) {
                res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
                throw error;
            }
            db.tasks.insert({ name, categoryId, content, points, flag, file, solved: [] }, (error, task) => {
                if (error) {
                    res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
                    throw error;
                }
                res.status(201).json(response_1.default.success({ task }));
            });
        });
    }
    else {
        db.tasks.insert({ name, categoryId, content, points, flag, solved: [] }, (error, task) => {
            if (error) {
                res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
                throw error;
            }
            res.status(201).json(response_1.default.success({ task }));
        });
    }
};
const updateTask = (db, config) => (req, res) => {
    var _a;
    const { _id } = req.params;
    if (!_id) {
        res.status(400).json(response_1.default.fail({ _id: 'A query is required' }));
        return;
    }
    const { name, content, flag, categoryId, } = req.body;
    const uploadedFile = (_a = req.files) === null || _a === void 0 ? void 0 : _a.file;
    const points = req.body.points
        ? Number.parseInt(req.body.points, 10)
        : null;
    if (points != null && !Number.isInteger(points)) {
        res.status(400).json(response_1.default.fail({
            points: 'Points have to be number',
        }));
        return;
    }
    if (uploadedFile) {
        const file = `./${config.staticDir}/${uploadedFile.name.split(' ').join('_')}`;
        if (!fs_1.default.existsSync(`./${config.staticDir}`)) {
            fs_1.default.mkdirSync(`./${config.staticDir}`, { recursive: true });
        }
        uploadedFile.mv(file, (error) => {
            if (error) {
                res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
                throw error;
            }
            db.tasks.update({ _id }, { $set: pickBy_1.default({ name, categoryId, content, points, flag, file }) }, { returnUpdatedDocs: true, multi: false }, (error, _, task) => {
                if (error) {
                    res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
                    throw error;
                }
                res.status(200).json(response_1.default.success({ task }));
            });
        });
    }
    else {
        db.tasks.update({ _id }, { $set: pickBy_1.default({ name, categoryId, content, points, flag }) }, { returnUpdatedDocs: true, multi: false }, (error, _, task) => {
            if (error) {
                res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
                throw error;
            }
            res.status(200).json(response_1.default.success({ task }));
        });
    }
};
const deleteTask = (db) => (req, res) => {
    const { _id } = req.params;
    if (!_id) {
        res.status(400).json(response_1.default.fail({ _id: 'A query is required' }));
        return;
    }
    db.tasks.remove({ _id }, {}, (error, numRemoved) => {
        if (error) {
            res.status(500).json(response_1.default.error('Server shutdowns due to internal critical error'));
            throw error;
        }
        res.status(200).json(response_1.default.success({ numRemoved }));
    });
};
exports.default = {
    creates: {
        category: createCategory,
        post: createPost,
        task: createTask,
    },
    deletes: {
        category: deleteCategory,
        post: deletePost,
        task: deleteTask,
    },
    updates: {
        task: updateTask,
    }
};
