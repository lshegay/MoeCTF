/* eslint-disable import/no-extraneous-dependencies */
import express from 'express';
import { Server } from 'http';
import fetch from 'node-fetch';
import start, { Moe } from '../src/app';
import clear from '../tools/clear';

let application: Moe;
let appServer: Server;

const adminCredentials = {
  name: 'moe_admin',
  password: 'moe_moe_password',
};

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
    body: JSON.stringify(adminCredentials),
  });

  const response = await fetching.json();

  expect(response).toBeDefined();
  expect(response.status).toBe('success');
  expect(response.data).toBeDefined();
  expect(response.data.user).toBeDefined();
  expect(response.data.user.name).toBe(adminCredentials.name);
  expect(response.data.user.admin).toBeTruthy();
});
