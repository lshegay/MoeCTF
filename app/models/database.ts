import { Express, RequestHandler } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { UrlWithParsedQuery } from 'url';
import Datastore from 'nedb';

export type Database = {
  users: Datastore;
  posts: Datastore;
  tasks: Datastore;
  categories: Datastore;
};

export interface RoutesParams {
  server: Express;
  db: Database;
  nextHandler:
    (req: IncomingMessage, res: ServerResponse, parsedUrl?: UrlWithParsedQuery) => Promise<void>;
}

export type Controller = (db: Database) => RequestHandler;
