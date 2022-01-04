import express from 'express';
import { Server } from 'http';
import fetch from 'node-fetch';
import start, { Moe } from '../src/app';
import clear from '../tools/clear';

let application: Moe;
let appServer: Server;

beforeAll((done) => {
  clear().then(() => {
    start(express()).then((moe) => {
      application = moe;
      appServer = application.listen(() => { done(); });
    });
  });
});

afterAll((done) => {
  appServer.close(done);
});

it('authenticates in admin account', async () => {
  const fetching = await fetch('http://localhost:4000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'moe_admin',
      password: 'moe_moe_password',
    }),
  });

  const response = await fetching.json();

  expect(response).not.toBeUndefined();
  expect(response.status).toBe('success');
  console.log(response);
});
