import path from 'path';
import crypto from 'crypto';
import readline from 'readline';
import fs from 'fs';
import Datastore from 'nedb';

import { Database } from '../app/models/database';
import config from '../app/settings/config';
import secret from '../app/settings/secret';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const databasePath = {
  users: path.join('./', config.databaseDir, config.databaseNames.users),
  posts: path.join('./', config.databaseDir, config.databaseNames.posts),
  tasks: path.join('./', config.databaseDir, config.databaseNames.tasks),
  categories: path.join('./', config.databaseDir, config.databaseNames.categories),
};
const sessionsPath = path.join('./', config.databaseDir, config.databaseNames.sessions);
const logsPath = path.resolve('./', config.logFileDir);

const main = async (): Promise<void> => {
  const answer = await new Promise((resolve) => rl.question(
    'WARNING! The procedure will fully restore database!\nAre you sure? (Y/N): ',
    (answer) => resolve(answer == 'Y')
  ));

  rl.close();

  if (!answer) {
    console.log('Shutdown...');
    process.exit();
  }

  console.log('We are restoring database now. Please wait a second.');

  if (fs.existsSync(logsPath)) fs.unlinkSync(logsPath);
  Object.keys(databasePath).forEach((key) => {
    if (fs.existsSync(databasePath[key])) fs.unlinkSync(databasePath[key]);
  });
  if (fs.existsSync(sessionsPath)) fs.unlinkSync(sessionsPath);

  const db: Database = {
    users: new Datastore({ filename: databasePath.users, autoload: true }),
    posts: new Datastore({ filename: databasePath.posts, autoload: true }),
    tasks: new Datastore({ filename: databasePath.tasks, autoload: true }),
    categories: new Datastore({ filename: path.join('./', databasePath.categories), autoload: true }),
  };

  db.posts.insert({
    name: 'Welcome to CTF!',
    content: 'This is another super-puper CTF with moe moe content and much more sweet love and care',
    date: Date.now(),
  });
  db.categories.insert([{ name: 'Joy' }, { name: 'Web' }, { name: 'Crypto' }], (_, categories: any[]) => {
    db.tasks.insert({
      name: 'Who is this?',
      content: 'Literally the question in the title',
      flag: 'MoeCTF{OwO}',
      points: 10,
      solved: [],
      categoryID: categories[0]._id,
    });
  });
  db.users.insert({
    name: secret.admin.username,
    password: crypto.pbkdf2Sync(secret.admin.password, secret.key, 1, 32, 'sha512').toString('hex'),
    email: secret.admin.email,
    admin: true,
    avatar: null,
    content: null,
  });
};

main();
