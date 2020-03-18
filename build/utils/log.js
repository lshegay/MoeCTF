"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const log = async (path, message, object) => {
    const currentDate = new Date(Date.now());
    const dumpedObject = object ? ` | <${JSON.stringify(object)}>` : '';
    let success = false;
    await fs_extra_1.default.ensureFile(path);
    fs_extra_1.default.appendFile(path, `[${currentDate.toLocaleString()}] ${message}${dumpedObject}\n`, (error) => {
        if (error) {
            if (error)
                throw error;
        }
        else {
            success = true;
        }
    });
    return success;
};
exports.default = log;
//# sourceMappingURL=log.js.map