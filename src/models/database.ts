import { RequestHandler } from 'express';
import Datastore from 'nedb';
import { Config } from './config';

export type Database = {
  users: Datastore;
  posts: Datastore;
  tasks: Datastore;
  categories: Datastore;
};

export type Controller = (db: Database, config: Config) => RequestHandler;
