import { Response, isValid, Status } from 'moectf-core/response';

const createError = <T>(response: Response<T>) => ({
  message: response.message,
  info: response.data,
  code: response.data
});

const fetcher = async <T>(url: string) => {
  const response: Response<T> = await (await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
  })).json();

  if (!isValid(response)) {
    const error = createError<T>({
      message: `Response object wasn't the JSend type ${response}`,
      status: Status.ERROR,
    });

    throw error;
  }

  if (response.status == 'error') {
    const error = createError<T>(response);

    throw error;
  }

  return response;
};

export default fetcher;
