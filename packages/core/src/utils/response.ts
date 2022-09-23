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
  data: Partial<Record<keyof T, string>> | null;
};

export type ResponseError<T> = {
  status: Status.ERROR;
  message: string;
  data?: T;
  code?: number;
};

export type Response<TSuccess, TFail = TSuccess, TError = unknown>
  = ResponseSuccess<TSuccess> | ResponseFail<TFail> | ResponseError<TError>;

const success = <T>(data?: T): ResponseSuccess<T> => ({
  status: Status.SUCCESS,
  data: isUndefined(data) ? null : data,
});

const fail = <T>(data?: Partial<Record<keyof T, string>>): ResponseFail<T> => ({
  status: Status.FAIL,
  data: isUndefined(data) ? null : data,
});

const error = <T>(message: string, data?: T, code?: number) => {
  const response: ResponseError<T> = {
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
export const projection = <T>(
  obj: T,
  proj: Partial<T>,
): Partial<any> => (pickBy(obj, (_, key) => (!proj[key])));

export default {
  success,
  fail,
  error,
};
