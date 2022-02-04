import fs from 'fs';
import express from 'express';
import cors from 'cors';
import start from './app';
import { Moe } from './models';

const server = async (): Promise<Moe> => {
  let CONFIG: Record<string, any> = {};

  try {
    CONFIG = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
  } catch (error) {
    console.log('No custom config was used. "config.json" was not found.');
  }

  const server = express();
  server.use(cors({
    origin: [CONFIG.starterDomain, CONFIG.adminDomain],
    credentials: true,
  }));

  const application = await start(server, undefined, CONFIG);

  application.listen((config) => {
    console.log(`Server is up at: ${config.protocol}//${config.hostname}:${config.port}`);
  });

  return application;
};

export default server();
