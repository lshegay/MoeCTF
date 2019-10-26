import { Database } from 'sqlite3';
import { Express } from 'express';
import Server from 'next-server/dist/server/next-server';

interface Plugin {
  db: Database;
  server: Express;
  app: Server;
}

export default Plugin;
