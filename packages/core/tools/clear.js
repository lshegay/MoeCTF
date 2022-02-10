const fs = require('fs');

const { promises } = fs;
const { F_OK } = fs.constants;

const DATABASE_DIR = './database';
const FILES_DIR = './files';
const LOGS_FILE = './logs.txt';

const clear = async () => {
  try {
    await promises.access(DATABASE_DIR, F_OK);
    await promises.rm(DATABASE_DIR, { recursive: true });
  } catch (e) { console.log(e); }
  try {
    await promises.access(FILES_DIR, F_OK);
    await promises.rm(FILES_DIR, { recursive: true });
  } catch (e) { console.log(e); }
  try {
    await promises.access(LOGS_FILE, F_OK);
    await promises.unlink(LOGS_FILE);
  } catch (e) { console.log(e); }

  await Promise.all([
    promises.mkdir(DATABASE_DIR),
    promises.mkdir(FILES_DIR),
  ]);
};

module.exports = clear;
