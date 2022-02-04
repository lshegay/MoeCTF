const fs = require('fs');

const { core, admin, starter } = JSON.parse(fs.readFileSync("./config.json", 'utf-8'));

admin.routes = core.routes;
admin.coreDomain = core.domain;
starter.routes = core.routes;
starter.coreDomain = core.domain;

core.adminDomain = admin.domain;
core.starterDomain = starter.domain;

fs.writeFileSync('./packages/core/config.json', JSON.stringify(core));

fs.writeFileSync('./packages/admin/config.json', JSON.stringify(admin));
const CONFIG_PACKAGE = JSON.parse(fs.readFileSync('./packages/admin/package.json', 'utf-8'));
CONFIG_PACKAGE.scripts.dev = `next dev -p ${admin.port}`;
CONFIG_PACKAGE.scripts.start = `next start -p ${admin.port}`;
fs.writeFileSync('./packages/admin/package.json', JSON.stringify(CONFIG_PACKAGE));

fs.writeFileSync('./packages/starter/config.json', JSON.stringify(starter));
const CONFIG_STARTER = JSON.parse(fs.readFileSync('./packages/starter/package.json', 'utf-8'));
CONFIG_STARTER.scripts.dev = `next dev -p ${starter.port}`;
CONFIG_STARTER.scripts.start = `next start -p ${starter.port}`;
fs.writeFileSync('./packages/starter/package.json', JSON.stringify(CONFIG_STARTER));
