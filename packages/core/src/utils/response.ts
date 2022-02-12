/** There are JSend wrapper functions */

import pickBy from 'lodash/pickBy';
import has from 'lodash/has';
import isNaN from 'lodash/isNaN';
import isUndefined from 'lodash/isUndefined';

export enum Status {
  SUCCESS = 'success',
  FAIL = 'fail',
  ERROR = 'error',
}

export type ResponseSuccess<T> = {
  status: Status.SUCCESS;
  data: T | null;
};

export type ResponseFail<T> = {
  status: Status.FAIL;
  data: Record<keyof T, string> | null;
};

export type ResponseError = {
  status: Status.ERROR;
  message: string;
  data?: Record<string, unknown>;
  code?: number;
};

export type Response<T> = ResponseSuccess<T> | ResponseFail<T> | ResponseError;

export type ResponseS<T, S extends Status> = {
  status: S;
  data?: T | null;
  code?: number;
  message?: string;
};

const success = <T>(data?: T): ResponseSuccess<T> => ({
  status: Status.SUCCESS,
  data: isUndefined(data) ? null : data,
});

const fail = <T>(data?: Record<keyof T, string>): ResponseFail<T> => ({
  status: Status.FAIL,
  data: isUndefined(data) ? null : data,
});

const error = (message: string, data?: Record<string, unknown>, code?: number) => {
  const response: ResponseError = {
    status: Status.ERROR,
    message,
  };
  if (code) { response.code = code; }
  if (data) { response.data = data; }

  return response;
};

/**
 * IsValid returns true if obj is valid for JSend API or not
 * @param obj - the JSend response
 */
export const isValid = (obj: Record<string, unknown>): boolean => {
  if (!obj) return false;
  if (!obj.status) return false;

  if ((obj.status == 'success' || obj.status == 'fail')
    && has(obj, 'data')) {
    return !isNaN(obj.data) && !isUndefined(obj.data);
  }

  if (obj.status == 'error'
    && has(obj, 'message')) {
    return !isNaN(obj.message) && !isUndefined(obj.message);
  }

  return false;
};

/**
 * Projection returns a new object based on obj which filtered by proj.
 * If the field in proj is null or undefined, it won't be returned with a new object.
 * @param obj - a based object
 * @param proj - a filter object
 * @returns a new filtered object
 */
export const projection = (
  obj: Record<string, unknown>,
  proj: Record<string, unknown>
): Record<string, unknown> => (
  pickBy(obj, (_, key) => (!proj[key]))
);

export const parse = <T>(text: string): Response<T> => {
  let obj: Record<string, unknown>;

  try {
    obj = JSON.parse(text);
  } catch (er) { return error('Text is not JSON'); }

  if (!isValid(obj)) return error('JSON response is not valid for JSend API');

  return (obj as unknown as Response<T>);
};

export default {
  success,
  fail,
  error,
};
