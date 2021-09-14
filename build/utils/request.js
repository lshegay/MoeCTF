"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forEach_1 = __importDefault(require("lodash/forEach"));
const convert = (obj) => {
    const form = new FormData();
    forEach_1.default(obj, (value, key) => form.append(key, value));
    return form;
};
exports.default = {
    convert,
};
//# sourceMappingURL=request.js.map