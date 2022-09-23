import { isValid, Status, Response, ResponseError, ResponseSuccess, ResponseFail } from 'moectf-core/response';

type FetcherOptions = RequestInit;

const fetcher = async <TSuccess, TFail = TSuccess, TError = unknown>(
  url: string,
  options: FetcherOptions = {},
): Promise<ResponseSuccess<TSuccess> | ResponseFail<TFail>> => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    ...options,
  });

  try {
    const json = await response.json() as Response<TSuccess, TFail, TError>;

    if (!isValid(json)) {
      const error: ResponseError<undefined> = {
        message: `Response object wasn't the JSend type. Data: ${JSON.stringify(json)}`,
        status: Status.ERROR,
      };

      throw error;
    }

    if (json.status == Status.ERROR) {
      throw json;
    }

    return json;
  } catch (e) {
    const error: ResponseError<undefined> = {
      message: `Response data wasn't the JSON object. Data: ${(await response.text())}`,
      status: Status.ERROR,
    };

    throw error;
  }
};

export default fetcher;
