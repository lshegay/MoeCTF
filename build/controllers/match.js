"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = __importDefault(require("../utils/response"));
const isNotEnded = (_, config) => (req, res, next) => {
    const currentDate = new Date(Date.now());
    if (!config.timer
        || (config.timer && config.endMatchDate && currentDate < new Date(config.endMatchDate))
        || (req.isAuthenticated() && req.user.admin)) {
        return next();
    }
    res.status(403).json(response_1.default.fail({}, 'Game has already finished'));
};
const isStarted = (_, config) => (req, res, next) => {
    const currentDate = new Date(Date.now());
    if (!config.timer
        || (config.timer && config.startMatchDate && currentDate >= new Date(config.startMatchDate))
        || (req.isAuthenticated() && req.user.admin)) {
        return next();
    }
    res.status(403).json(response_1.default.fail({}, 'Game has not started yet'));
};
exports.default = {
    is: {
        started: isStarted,
        not: {
            ended: isNotEnded,
        }
    },
};
