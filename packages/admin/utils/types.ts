import { Config } from '@models/config';
import { Database } from '@models/database';
import { IncomingMessage } from 'http';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

type Request = IncomingMessage & {
  cookies: NextApiRequestCookies;
  config: Config;
  db: Database;
}

export type {
  Overwrite,
  Request,
};
