import pickBy from 'lodash/pickBy';
import has from 'lodash/has';

export type Status = 'success' | 'fail' | 'error';

export interface Response {
  status: Status;
  data?: any;
  code?: number;
  message?: string;
}

const success = (data: any = null): Response => ({
  status: 'success',
  data,
});

const fail = (data?: any, message?: string): Response => ({
  status: 'fail',
  data: {
    message,
    ...data,
  },
});

const error = (message: string, data?: any, code?: number): Response => ({
  status: 'error',
  message,
  ...(data == undefined ? {} : { data }),
  ...(code == undefined ? {} : { code }),
});

/**
 * IsValid returns true if obj is valid for JSend API or not
 * @param obj - the JSend response
 */
const isValid = (obj: any): boolean => (
  obj
    ? (has(obj, 'status')
      ? (obj.status == 'success' || obj.status == 'fail'
        ? has(obj, 'data')
        : has(obj, 'message'))
      : false)
    : false
);

/**
 * Projection returns a new object based on obj which filtered by proj.
 * If the field in proj is null or undefined, it won't be returned with a new object.
 * @param obj - a based object
 * @param proj - a filter object
 * @returns a new filtered object
 */
export const projection = (obj: any, proj: any): any => pickBy(obj, (_, key) => (!proj[key]));

export const parse = (text: string): Response => {
  let obj: any;

  try {
    obj = JSON.parse(text);
  } catch (error) { return error('text is not JSON'); }

  if (!isValid(obj)) return error('JSON response is not valid for JSend API');

  return obj;
};

export default {
  success,
  fail,
  error,
  isValid,
};
