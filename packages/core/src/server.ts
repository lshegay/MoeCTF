/* import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import next from 'next';
import start from './app';
import { Moe, Config } from './models';

const dev = process.env.NODE_ENV != 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = async (): Promise<Moe> => {
  let config: Partial<Config> = {};

  try {
    config = await fs.readJSON(path.join('./', 'config.json'));
  } catch (error) {
    console.log(error);
  }

  await app.prepare();

  const application = await start(express(), undefined, config);
  application.server.use((req, res) => {
    handle(req, res);
  });

  application.listen((config) => {
    console.log(`Server is up at: ${config.protocol}//${config.hostname}:${config.port}`);
  });

  return application;
};

export default server();
 */
