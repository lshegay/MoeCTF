import fs from 'fs';
import { Config } from 'moectf-core';
import crypto from 'crypto';
import fetch from 'node-fetch';

const conf: Config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const fullfill = fs.readFileSync('./fullfill.txt', 'utf8');

if (conf?.routes.register == undefined) {
  const teams = fullfill.trim().split(',').map((t) => (t.trim()));
  const route = conf.routes.register ?? '/api/register';

  console.log(teams);

  teams.forEach((team) => {
    const password = crypto.randomBytes(10).toString('hex');

    fetch(new URL(route, conf.domain).toString(), {
      method: 'POST',
      body: JSON.stringify({
        name: team,
        email: `${team}@${team}.fareastctf`,
        password,
        password2: password,
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((v) => {
      v.json().then((v) => {
        if (v.status == 'success') {
          console.log(v.data.user);
          fs.appendFileSync('./fullfillResult.txt', `${team} ${password}\n`, { encoding: 'utf-8', flag: 'wx' });
        }
      });
    });
  });
}
