const fs = require('fs/promises');
const { constants: { F_OK } } = require('fs');

const DATABASE_DIR = './database';
const FILES_DIR = './files';
const LOGS_FILE = './logs.txt';

const clear = async () => {
  try {
    await fs.access(DATABASE_DIR, F_OK);
    await fs.rm(DATABASE_DIR, { recursive: true, force: true });
  } catch(e) {}
  try {
    await fs.access(FILES_DIR, F_OK);
    await fs.rm(FILES_DIR, { recursive: true, force: true });
  } catch(e) {}
  try {
    await fs.access(LOGS_FILE, F_OK);
    await fs.rm(LOGS_FILE);
  } catch(e) {}
  
  await Promise.all([
    fs.mkdir(DATABASE_DIR),
    fs.mkdir(FILES_DIR),
  ]);
};

module.exports = clear;
