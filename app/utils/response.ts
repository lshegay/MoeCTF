import pickBy from 'lodash/pickBy';

export type Status = 'success' | 'fail' | 'error';

export interface Response {
  status: Status;
  data: any;
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

const error = (message: string, data: any = null, code?: number): Response => ({
  status: 'error',
  message,
  data,
  ...(code == undefined ? {} : { code }),
});

export const projection = (obj: any, proj: any): any => pickBy(obj, (_, key) => (!proj[key] && typeof proj[key] != 'boolean'));

const isValid = (obj: any): boolean => (
  obj
    ? (obj.status
      ? (obj.status == 'success' || obj.status == 'fail'
        ? obj.data
        : obj.message)
      : false)
    : false
);

export default {
  success,
  fail,
  error,
  isValid,
};
