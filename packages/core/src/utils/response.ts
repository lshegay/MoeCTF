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

export type Response<T> = {
  status: Status;
  data?: T | null;
  code?: number;
  message?: string;
};

const success = <T>(data?: T): Response<T> => ({
  status: Status.SUCCESS,
  data: isUndefined(data) ? null : data,
});

const fail = <T>(data?: T): Response<T> => ({
  status: Status.FAIL,
  data: isUndefined(data) ? null : data,
});

const error = <T>(message: string, data?: T, code?: number): Response<T> => ({
  status: Status.ERROR,
  message,
  ...(isUndefined(data) ? {} : { data }),
  ...(isUndefined(code) ? {} : { code }),
});

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
  isValid,
};
