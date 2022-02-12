const { exec, spawn } = require('child_process');

const args = process.argv.slice(2);

const DEVELOPMENT_MODE = args.find((value) => value == '--dev');

exec('npx swc ./src --config-file .swcrc -d ./.build', (_, stdout) => {
  console.log(stdout);
  if (DEVELOPMENT_MODE) {
    const server = spawn('node', ['.build/server.js']);

    server.stdout.on('data', (data) => {
      console.log(data.toString());
    });
  }
});

console.time('Compiled with tsc');
exec('npx tsc', () => {
  console.timeEnd('Compiled with tsc');
});
