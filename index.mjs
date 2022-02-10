import cp, { spawn } from 'child_process';
import util from 'util';
import task from 'tasuku';
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

const concurrently = (cmd, title) => (
  task(title, async () => {
    await new Promise((resolve) => {
      const current = spawn('npx', [
        'concurrently',
        `"cd packages/admin && npm run ${cmd}"`,
        `"cd packages/core && npm run ${cmd}"`,
        `"cd packages/starter && npm run ${cmd}"`,
      ], {
        stdio: 'inherit',
        shell: true,
      });

      current.on('spawn', () => {
        resolve();
      });
    });
  })
);

const argument = process.argv.length > 2 ? process.argv[2] : null;

(async () => {
  switch (argument) {
    case '--dev': {
      await bootstrap();
      await setup();
      await concurrently('dev', 'Development is Working');

      break;
    }

    case '--build': {
      await bootstrap();
      await setup();
      await concurrently('build', 'Applications are Building');

      break;
    }

    case '--start': {
      await bootstrap();
      await setup();
      await concurrently('start', 'Production is Working');

      break;
    }

    default:
  }
})();
