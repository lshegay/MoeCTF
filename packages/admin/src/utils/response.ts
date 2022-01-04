import pickBy from 'lodash/pickBy';
import has from 'lodash/has';

export type Status = 'success' | 'fail' | 'error';

export interface Response<T> {
  status: Status;
  data?: T;
  code?: number;
  message?: string;
}

const success = <T>(data?: T): Response<T> => ({
  status: 'success',
  data,
});

const fail = <T>(data?: T): Response<T> => ({
  status: 'fail',
  data,
});

const error = <T>(message: string, data?: T, code?: number): Response<T> => ({
  status: 'error',
  message,
  ...(data == undefined ? {} : { data }),
  ...(code == undefined ? {} : { code }),
});

/**
 * IsValid returns true if obj is valid for JSend API or not
 * @param obj - the JSend response
 */
const isValid = (obj: Record<string, unknown>): boolean => (
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
  } catch (er) { return error('text is not JSON'); }

  if (!isValid(obj)) return error('JSON response is not valid for JSend API');

  return (obj as unknown as Response<T>);
};

export default {
  success,
  fail,
  error,
  isValid,
};
