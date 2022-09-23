import cp from 'child_process';
import util from 'util';
import task from 'tasuku';
import concurrently from 'concurrently';
import { readFile, writeFile } from 'fs/promises';

const exec = util.promisify(cp.exec);

const bootstrap = () => (
  task('Bootstrap packages with each other', async () => {
    await exec('npx lerna bootstrap');
  })
);

const setup = () => (
  task('Setup Configuration Files', async ({ setStatus, setError }) => {
    const config = await readFile('./config.json', 'utf-8');
    const { core, admin, starter } = JSON.parse(config);
    const writings = [];

    setStatus('Creating JSON Configuration Files');

    const { routes, domain } = core;

    if (!routes) {
      setError('"config.json" doesn\'t have a routes property');
      return;
    }

    if (!domain) {
      setError('"config.json" doesn\'t have a domain property');
      return;
    }

    admin.routes = routes;
    starter.routes = routes;
    admin.coreDomain = domain;
    starter.coreDomain = domain;

    core.adminDomain = admin.domain;
    core.starterDomain = starter.domain;

    writings.push(writeFile('./packages/core/config.json', JSON.stringify(core, null, 2)));
    writings.push(writeFile('./packages/admin/config.json', JSON.stringify(admin, null, 2)));
    writings.push(writeFile('./packages/starter/config.json', JSON.stringify(starter, null, 2)));

    setStatus('Editing package.json Files');

    const packageConfig = JSON.parse(await readFile('./packages/admin/package.json', 'utf-8'));
    packageConfig.scripts.dev = `next dev -p ${admin.port}`;
    packageConfig.scripts.start = `next start -p ${admin.port}`;
    writings.push(writeFile('./packages/admin/package.json', JSON.stringify(packageConfig, null, 2)));

    const starterConfig = JSON.parse(await readFile('./packages/starter/package.json', 'utf-8'));
    starterConfig.scripts.dev = `next dev -p ${starter.port}`;
    starterConfig.scripts.start = `next start -p ${starter.port}`;
    writings.push(writeFile('./packages/starter/package.json', JSON.stringify(starterConfig, null, 2)));

    setStatus('Writings');

    await Promise.all(writings);

    setStatus('Finished');
  })
);

const dev = async (names) => {
  await task('Development started', async () => {
    concurrently([
      ...names.map((name) => ({ name, command: `cd packages/${name} && npm run dev` })),
      { name: 'config', command: 'npx nodemon --exec "node index.mjs --setup" -e json --watch config.json' }
    ]);
  });
};

const build = async (names) => {
  await task('Building started', async () => {
    concurrently(names.map((name) => ({ name, command: `cd packages/${name} && npm run build` })));
  });
};

const start = async (names) => {
  await task('Application launched', async () => {
    concurrently(names.map((name) => ({ name, command: `cd packages/${name} && npm run start` })));
  });
};

const argument = process.argv.length > 2 ? process.argv[2] : null;
const packageNames = ['admin', 'core', 'starter'];

(async () => {
  switch (argument) {
    case '--dev': {
      await bootstrap();
      await setup();
      await dev(packageNames);

      break;
    }

    case '--build': {
      await bootstrap();
      await setup();
      await build(packageNames);

      break;
    }

    case '--start': {
      await bootstrap();
      await setup();
      await start(packageNames);

      break;
    }

    case '--setup': {
      await setup();

      break;
    }

    default: break;
  }
})();
