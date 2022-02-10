import { RequestHandler } from 'express';
import Datastore from 'nedb-promises';
import { Config } from './config';

// TODO: проставить нормальные типы для Datastore
export type Database = {
  users: Datastore;
  posts: Datastore;
  tasks: Datastore;
  cache: Datastore;
}

export type Controller = (db: Database, config: Config) => RequestHandler;
