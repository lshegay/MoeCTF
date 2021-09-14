"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pickBy_1 = __importDefault(require("lodash/pickBy"));
const has_1 = __importDefault(require("lodash/has"));
const success = (data = null) => ({
    status: 'success',
    data,
});
const fail = (data, message) => ({
    status: 'fail',
    data: {
        message,
        ...data,
    },
});
const error = (message, data, code) => ({
    status: 'error',
    message,
    ...(data == undefined ? {} : { data }),
    ...(code == undefined ? {} : { code }),
});
/**
 * IsValid returns true if obj is valid for JSend API or not
 * @param obj - the JSend response
 */
const isValid = (obj) => (obj
    ? (has_1.default(obj, 'status')
        ? (obj.status == 'success' || obj.status == 'fail'
            ? has_1.default(obj, 'data')
            : has_1.default(obj, 'message'))
        : false)
    : false);
/**
 * Projection returns a new object based on obj which filtered by proj.
 * If the field in proj is null or undefined, it won't be returned with a new object.
 * @param obj - a based object
 * @param proj - a filter object
 * @returns a new filtered object
 */
exports.projection = (obj, proj) => pickBy_1.default(obj, (_, key) => (!proj[key]));
exports.parse = (text) => {
    let obj;
    try {
        obj = JSON.parse(text);
    }
    catch (er) {
        return error('text is not JSON');
    }
    if (!isValid(obj))
        return error('JSON response is not valid for JSend API');
    return obj;
};
exports.default = {
    success,
    fail,
    error,
    isValid,
};
//# sourceMappingURL=response.js.map