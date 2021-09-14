import { Express } from 'express';
import { Config } from './config';
import { Database } from './database';

export type Moe = {
  server: Express;
  db: Database;
  config: Config;
}
