import isNil from 'lodash/isNil';
import isNaN from 'lodash/isNaN';
import forEach from 'lodash/forEach';

const convert = (obj: Record<string, any>): FormData => {
  const form = new FormData();
  forEach(obj, (value, key) => {
    if (isNil(value) || isNaN(value)) return;

    if (Array.isArray(value)) {
      form.append(key, JSON.stringify(value));
      return;
    }

    form.append(key, value);
  });
  return form;
};

export default {
  convert,
};
