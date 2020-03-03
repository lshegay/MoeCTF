import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import config from '../app/settings/config';

const host = config.hostname + (config.port ? `:${config.port}` : '');
const domain = `${config.protocol}//${host}`;

chai.use(chaiHttp);

describe('User Authorization', () => {
  it('should register a new user', () => {
    const userData = {
      username: 'another_user',
      email: 'another_user@another.com',
      password: 'another_password_that_is_bruh',
      password2: 'another_password_that_is_bruh',
    };

    chai.request(domain)
      .post('/register')
      .type('form')
      .send(userData)
      .end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
      });
  });
});
