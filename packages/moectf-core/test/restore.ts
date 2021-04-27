import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { CONFIG_DEFAULTS } from '../src/app';

const config = { ...CONFIG_DEFAULTS };
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const sessionsPath = path.join('./', config.databaseDir, config.databaseNames.sessions);
const staticPath = path.join('./', config.staticDir);
const logsPath = path.resolve('./', config.logFileDir, config.logFileName);

const main = async (): Promise<void> => {
  const answer = await new Promise((resolve) => rl.question(
    'WARNING! The procedure will fully restore database!\nAre you sure? (Y/N): ',
    (answer) => resolve(answer.toLowerCase() == 'y')
  ));

  rl.close();

  if (!answer) {
    console.log('Shutdown...');
    process.exit();
  }

  console.log('We are restoring database now. Please wait a second.');

  if (fs.existsSync(logsPath)) fs.unlinkSync(logsPath);
  if (fs.existsSync(sessionsPath)) fs.unlinkSync(sessionsPath);
  if (fs.existsSync(config.databaseDir)) fs.rmdirSync(config.databaseDir, { recursive: true });
  if (fs.existsSync(staticPath)) fs.rmdirSync(staticPath, { recursive: true });
};

main();
