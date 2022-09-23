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

  CONFIG.cors = [CONFIG.starterDomain, CONFIG.adminDomain];

  const application = await start(express(), undefined, CONFIG);

  application.listen((config) => {
    console.log(`Server is up at: ${config.protocol}//${config.hostname}:${config.port}`);
  }).on('error', (e) => { console.log(e) });

  return application;
};

export default server();
