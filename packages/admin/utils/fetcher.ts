import { isValid, Status, Response, ResponseError } from 'moectf-core/response';

const fetcher = async <T>(url: string): Promise<Response<T>> => {
  const response = await (await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })).json() as Response<T>;

  if (!isValid(response)) {
    const error: ResponseError = {
      message: `Response object wasn't the JSend type ${JSON.stringify(response)}`,
      status: Status.ERROR,
    };

    throw error;
  }

  if (response.status == Status.ERROR) {
    throw response;
  }

  return response;
};

export default fetcher;
