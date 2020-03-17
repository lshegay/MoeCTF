import { Express } from 'express';
import { Database } from './database';
import { Config } from './config';

export interface MoeParams {
  server: Express;
  db: Database;
  config: Config;
}
