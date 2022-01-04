import response, { parse, projection } from '../src/utils/response';

describe('Utils Response', () => {
  const { isValid } = response;

  describe('JSend classification', () => {
    test('isValid is valid (*/ω\\*)', () => {
      const success = {
        status: 'success',
        data: {
          post: { id: 1, title: 'A blog post', body: 'Some useful content' }
        }
      };

      expect(isValid(success)).toBe(true);

      const successDelete = {
        status: 'success',
        data: null
      };

      expect(isValid(successDelete)).toBe(true);

      const successWithoutData = { status: 'success' };

      expect(isValid(successWithoutData)).toBe(false);

      const successWithUndefinedData = { status: 'success', data: undefined };

      expect(isValid(successWithUndefinedData)).toBe(false);

      const fail = {
        status: 'fail',
        data: { title: 'A title is required' }
      };

      expect(isValid(fail)).toBe(true);

      const error = {
        status: 'error',
        message: 'Unable to communicate with database'
      }

      expect(isValid(error)).toBe(true);

      const errorWithoutMessage = { status: 'error' };

      expect(isValid(errorWithoutMessage)).toBe(false);

      const errorWithNullMessage = { status: 'error', message: null };

      expect(isValid(errorWithNullMessage)).toBe(true);

      const errorWithUndefinedMessage = { status: 'error', message: undefined };

      expect(isValid(errorWithUndefinedMessage)).toBe(false);

      const empty = {}

      expect(isValid(empty)).toBe(false);

      const emptyWithData = { data };

      expect(isValid(emptyWithData)).toBe(false);

      const wrongStatus = { status: 'azunyan' };

      expect(isValid(wrongStatus)).toBe(false);
    });

    const data = {
      user: {
        id: 1,
        username: 'Hirasawa Yui',
      }
    };

    test('success response with empty data', () => {
      expect(isValid(response.success())).toBe(true);
    });
    test('success response with data', () => {
      expect(isValid(response.success(data))).toBe(true);
    });
    test('fail response with empty data', () => {
      expect(isValid(response.fail())).toBe(true);
    });
    test('fail response with data', () => {
      expect(isValid(response.fail(data))).toBe(true);
    });
    test('error response', () => {
      expect(isValid(response.error('This is an error!'))).toBe(true);
      expect(isValid(response.error('This is an error!', data))).toBe(true);
      expect(isValid(response.error('This is an error!', null, 200))).toBe(true);
      expect(isValid(response.error('This is an error!', data, 200))).toBe(true);
    });
  });
});
