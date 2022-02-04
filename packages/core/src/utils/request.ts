import forEach from 'lodash/forEach';

const convert = (obj: Record<string, any>): FormData => {
  const form = new FormData();
  forEach(obj, (value, key) => form.append(key, value));
  return form;
};

export default {
  convert,
};
