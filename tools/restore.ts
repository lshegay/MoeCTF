import path from 'path';
import sqlite3 from 'sqlite3';
import crypto from 'crypto';
import fs from 'fs';

import config from '../app/settings/config';
import secret from '../app/settings/secret';

const databasePath = path.resolve('./', config.database);
const sessionsPath = path.resolve('./', config.databaseSessions);
const logsPath = path.resolve('./', config.logFileDir);

console.log(databasePath);

if (fs.existsSync(logsPath)
  && fs.existsSync(databasePath)
  && fs.existsSync(sessionsPath)) {
  fs.unlinkSync(logsPath);
  fs.unlinkSync(databasePath);
  fs.unlinkSync(sessionsPath);
}

const sq = sqlite3.verbose();
const db = new sq.Database(
  databasePath,
  (error): void => {
    if (error) console.error(error);
  }
);

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS post ( '
    + 'post_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, '
    + 'post_title TEXT NOT NULL, '
    + 'post_content TEXT NOT NULL, '
    + 'post_date INTEGER NOT NULL)');
  db.run('CREATE TABLE IF NOT EXISTS stask ( '
    + 'stask_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, '
    + 'stask_date INTEGER NOT NULL, '
    + 'task_id INTEGER NOT NULL, '
    + 'user_id INTEGER NOT NULL)');
  db.run('CREATE TABLE IF NOT EXISTS task ( '
    + 'task_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, '
    + 'task_name TEXT NOT NULL, '
    + 'task_content TEXT, '
    + 'task_flag TEXT NOT NULL, '
    + 'task_points INTEGER NOT NULL, '
    + 'task_file TEXT, '
    + 'category_id INTEGER NOT NULL)');
  db.run('CREATE TABLE IF NOT EXISTS user ( '
    + 'user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, '
    + 'user_name TEXT NOT NULL UNIQUE, '
    + 'user_content TEXT, '
    + 'user_password TEXT NOT NULL, '
    + 'user_email TEXT UNIQUE, '
    + 'user_admin BLOB NOT NULL DEFAULT 0, '
    + 'user_avatar TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS category ( '
    + 'category_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, '
    + 'category_name TEXT NOT NULL)');
  db.run('INSERT OR IGNORE INTO user '
    + '(user_name, user_email, user_password, user_admin) VALUES (?, ?, ?, ?)',
  secret.admin.username,
  secret.admin.email,
  crypto.pbkdf2Sync(secret.admin.password, secret.key, 1, 32, 'sha512').toString('hex'),
  1);
});