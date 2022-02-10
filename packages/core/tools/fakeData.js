/* eslint-disable import/no-extraneous-dependencies */
const { faker } = require('@faker-js/faker');
const fetch = require('node-fetch').default;
const fs = require('fs');
const join = require('url-join');

const { domain, routes, adminCreditals } = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

const parseCookies = (response) => {
  const raw = response.headers.raw()['set-cookie'];
  return raw.map((entry) => {
    const parts = entry.split(';');
    const cookiePart = parts[0];
    return cookiePart;
  }).join(';');
};

(async () => {
  let users = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 100; i++) {
    const res = fetch(join(domain, routes.register), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password: 'password',
        password2: 'password',
      }),
    });

    users.push(res);
  }

  users = await Promise.all(users);

  users = await Promise.all(users.map((v) => v.json()));

  if (users[0].status == 'success') {
    console.log('Users are created!');
  }

  /** Authentication */

  const res = await fetch(join(domain, routes.login), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: adminCreditals.username,
      password: adminCreditals.password,
    }),
  });

  const cookies = parseCookies(res);

  let tasks = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 100; i++) {
    const res = fetch(join(domain, routes.tasksPost), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      body: JSON.stringify({
        name: faker.hacker.phrase(),
        points: 500,
        flag: 'flag',
        content: faker.lorem.paragraphs(2, '\n'),
        tags: faker.random.arrayElements(['Joy', 'Misc', 'Web', 'Reverse', 'Crypto', 'Forensic', 'Stegano']),
      }),
    });

    tasks.push(res);
  }

  tasks = await Promise.all(tasks);

  tasks = await Promise.all(tasks.map((v) => v.json()));

  if (tasks[0].status == 'success') {
    console.log('Tasks are created!');
  } else {
    console.log(tasks[0]);
  }
})();
