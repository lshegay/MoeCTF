import chai from 'chai';
import fs from 'fs';
import path from 'path';
import chaiHttp from 'chai-http';
import { Server as HttpServer } from 'http';
import Server from 'next/dist/next-server/server/next-server';
import { db, prepared } from '../app/server';
import config from '../app/settings/config';
import secret from '../app/settings/secret';
import { Response } from '../app/utils/response';

const should = chai.should();
const host = config.hostname + (config.port ? `:${config.port}` : '');
const domain = `${config.protocol}//${host}`;

chai.use(chaiHttp);

let httpServer: HttpServer;
let nextServer: Server;

describe('User Authorization', () => {
  const userCreditals = {
    name: 'test_username',
    email: 'test_username@gmail.com',
    password: 'user_password_test',
    password2: 'user_password_test',
  };
  let agent: ChaiHttp.Agent;

  before(function b(done) {
    this.timeout(10000);

    prepared.then(({ http, app }) => {
      httpServer = http;
      nextServer = app;
      agent = chai.request.agent(domain).keepOpen();
      db.users.remove({ name: userCreditals.name }, {}, done);
    });
  });

  after((done) => {
    agent.close();
    done();
  });

  it('should create a new account', (done) => {
    agent
      .post('/api/register')
      .type('form')
      .send(userCreditals)
      .end((error, res) => {
        if (error) return done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          switch (json.status) {
            case 'success': {
              should.exist(json.data.user);
              should.equal(res.status, 201);
              done();
              break;
            }
            case 'fail': {
              should.exist(json.data.message);
              done(new Error(json.data.message));
              break;
            }
            case 'error': {
              should.exist(json.message);
              done(new Error(json.message));
              break;
            }
            default: {
              done(new Error('json.status expected to be success | fail | error'));
              break;
            }
          }
        }
      });
  });

  it('should logout from account', function i(done) {
    this.timeout(10000);

    agent
      .get('/api/logout')
      .end((error, res) => {
        if (error) return done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          should.equal(json.status, 'success');
          should.equal(res.status, 200);
          done();
        }
      });
  });

  it('should login in account', function i(done) {
    this.timeout(10000);

    agent
      .post('/api/login')
      .type('form')
      .send(userCreditals)
      .end((error, res) => {
        if (error) return done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          switch (json.status) {
            case 'success': {
              should.exist(json.data.user);
              should.equal(res.status, 200);
              done();
              break;
            }
            case 'fail': {
              should.exist(json.data.message);
              done(new Error(json.data.message));
              break;
            }
            case 'error': {
              should.exist(json.message);
              done(new Error(json.message));
              break;
            }
            default: {
              done(new Error('json.status expected to be success | fail | error'));
              break;
            }
          }
        }
      });
  });
});

describe('Admin Api', () => {
  const agent = chai.request.agent(domain);
  const userCreditals = {
    name: secret.admin.username,
    password: secret.admin.password,
  };
  let mainCategoryId: string;

  before((done) => {
    agent
      .post('/api/login')
      .type('form')
      .send(userCreditals)
      .end((error, res) => {
        if (error) return done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          switch (json.status) {
            case 'success': {
              done();
              break;
            }
            case 'fail': {
              done(new Error(json.data.message));
              break;
            }
            case 'error': {
              done(new Error(json.message));
              break;
            }
            default: {
              done(new Error('json.status expected to be success | fail | error'));
              break;
            }
          }
        }
      });
  });

  after((done) => {
    agent.close();
    db.categories.remove({ _id: mainCategoryId }, {}, done);
  });

  let categoryId: string;
  it('should create a new category', (done) => {
    agent
      .post('/api/admin/categories')
      .type('form')
      .send({
        name: 'New Category',
      })
      .end((error, res) => {
        if (error) return done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          switch (json.status) {
            case 'success': {
              should.exist(json.data.category);
              should.exist(json.data.category._id);
              should.exist(json.data.category.name);
              should.equal(json.data.category.name, 'New Category');
              should.equal(res.status, 201);
              categoryId = json.data.category._id;
              done();
              break;
            }
            case 'fail': {
              done(new Error(JSON.stringify(json.data)));
              break;
            }
            case 'error': {
              done(new Error(json.message));
              break;
            }
            default: {
              done(new Error('json.status expected to be success | fail | error'));
              break;
            }
          }
        }
      });
  });

  it('should delete a category', (done) => {
    agent
      .delete(`/api/admin/categories/${categoryId}`)
      .end((error, res) => {
        if (error) return done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          switch (json.status) {
            case 'success': {
              should.exist(json.data.numRemoved);
              should.equal(json.data.numRemoved, 1);
              should.equal(res.status, 200);
              done();
              break;
            }
            case 'fail': {
              done(new Error(JSON.stringify(json.data)));
              break;
            }
            case 'error': {
              done(new Error(json.message));
              break;
            }
            default: {
              done(new Error('json.status expected to be success | fail | error'));
              break;
            }
          }
        }
      });
  });

  let postId: string;
  it('should create a new post', (done) => {
    agent
      .post('/api/admin/posts')
      .type('form')
      .send({
        name: 'New Post',
        content: 'Another post content which is very bad... like really, it\'s bad.',
      })
      .end((error, res) => {
        if (error) return done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          switch (json.status) {
            case 'success': {
              should.exist(json.data.post);
              should.exist(json.data.post._id);
              should.exist(json.data.post.name);
              should.equal(json.data.post.name, 'New Post');
              should.equal(res.status, 201);
              postId = json.data.post._id;
              done();
              break;
            }
            case 'fail': {
              done(new Error(JSON.stringify(json.data)));
              break;
            }
            case 'error': {
              done(new Error(json.message));
              break;
            }
            default: {
              done(new Error('json.status expected to be success | fail | error'));
              break;
            }
          }
        }
      });
  });

  it('should delete a post', (done) => {
    agent
      .delete(`/api/admin/posts/${postId}`)
      .end((error, res) => {
        if (error) return done(error);
        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          switch (json.status) {
            case 'success': {
              should.exist(json.data.numRemoved);
              should.equal(json.data.numRemoved, 1);
              should.equal(res.status, 200);
              done();
              break;
            }
            case 'fail': {
              done(new Error(json.data.message));
              break;
            }
            case 'error': {
              done(new Error(json.message));
              break;
            }
            default: {
              done(new Error('json.status expected to be success | fail | error'));
              break;
            }
          }
        }
      });
  });

  let taskId: string;
  it('should create a new task', (done) => {
    agent
      .post('/api/admin/categories')
      .type('form')
      .send({
        name: 'New Category',
      })
      .end((error, res) => {
        if (error) done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          mainCategoryId = json.data.category._id;
        }

        agent
          .post('/api/admin/tasks')
          .type('form')
          .send({
            name: 'New Task',
            content: 'Task Content',
            flag: 'MoeCTF{Borb Borb}',
            points: 10,
            categoryId: mainCategoryId,
          })
          .end((error, res) => {
            if (error) return done(error);

            let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
            try {
              json = JSON.parse(res.text);
            } catch (error) {
              done(error);
            } finally {
              switch (json.status) {
                case 'success': {
                  should.exist(json.data);
                  should.exist(json.data.task);
                  should.exist(json.data.task._id);
                  should.exist(json.data.task.name);
                  should.equal(json.data.task.name, 'New Task');
                  should.equal(res.status, 201);
                  taskId = json.data.task._id;
                  done();
                  break;
                }
                case 'fail': {
                  done(new Error(JSON.stringify(json.data)));
                  break;
                }
                case 'error': {
                  done(new Error(json.message));
                  break;
                }
                default: {
                  done(new Error('json.status expected to be success | fail | error'));
                  break;
                }
              }
            }
          });
      });
  });

  it('should update a task', (done) => {
    agent
      .put(`/api/admin/tasks/${taskId}`)
      .type('form')
      .send({
        name: 'Not Really New Task',
        flag: 'MoeCTF{Borb Borb 2 2 2 2}',
        points: 15,
      })
      .end((error, res) => {
        if (error) return done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          switch (json.status) {
            case 'success': {
              should.exist(json.data);
              should.exist(json.data.task);
              should.exist(json.data.task._id);
              should.not.equal(json.data.task.name, 'New Task');
              should.equal(json.data.task.content, 'Task Content');
              should.not.equal(json.data.task.flag, 'MoeCTF{Borb Borb}');
              should.not.equal(json.data.task.points, 10);
              should.equal(json.data.task.categoryId, mainCategoryId);
              should.equal(res.status, 200);
              taskId = json.data.task._id;
              done();
              break;
            }
            case 'fail': {
              done(new Error(JSON.stringify(json.data)));
              break;
            }
            case 'error': {
              done(new Error(json.message));
              break;
            }
            default: {
              done(new Error('json.status expected to be success | fail | error'));
              break;
            }
          }
        }
      });
  });

  it('should update a task WITH a first file', (done) => {
    agent
      .put(`/api/admin/tasks/${taskId}`)
      .type('form')
      .attach('file', fs.readFileSync(path.resolve('./', 'test/static/nyan.png')), 'nyan.png')
      .end((error, res) => {
        if (error) return done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          switch (json.status) {
            case 'success': {
              should.exist(json.data);
              should.exist(json.data.task);
              should.exist(json.data.task._id);
              should.not.equal(json.data.task.name, 'New Task');
              should.equal(json.data.task.content, 'Task Content');
              should.not.equal(json.data.task.flag, 'MoeCTF{Borb Borb}');
              should.not.equal(json.data.task.points, 10);
              should.not.equal(json.data.task.points, 10);
              should.exist(json.data.task.file);
              should.equal(json.data.task.categoryId, mainCategoryId);
              should.equal(res.status, 200);
              taskId = json.data.task._id;
              done();
              break;
            }
            case 'fail': {
              done(new Error(JSON.stringify(json.data)));
              break;
            }
            case 'error': {
              done(new Error(json.message));
              break;
            }
            default: {
              done(new Error('json.status expected to be success | fail | error'));
              break;
            }
          }
        }
      });
  });

  it('should update a task WITH a second file', (done) => {
    agent
      .put(`/api/admin/tasks/${taskId}`)
      .type('form')
      .attach('file', fs.readFileSync(path.resolve('./', 'test/static/code.txt')), 'code.txt')
      .end((error, res) => {
        if (error) return done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          switch (json.status) {
            case 'success': {
              should.exist(json.data);
              should.exist(json.data.task);
              should.exist(json.data.task._id);
              should.not.equal(json.data.task.name, 'New Task');
              should.equal(json.data.task.content, 'Task Content');
              should.not.equal(json.data.task.flag, 'MoeCTF{Borb Borb}');
              should.not.equal(json.data.task.points, 10);
              should.not.equal(json.data.task.points, 10);
              should.not.equal(json.data.task.file, `./${config.staticDir}/${'nyan.png'.split(' ').join('_')}`);
              should.equal(json.data.task.categoryId, mainCategoryId);
              should.equal(res.status, 200);
              taskId = json.data.task._id;
              done();
              break;
            }
            case 'fail': {
              done(new Error(JSON.stringify(json.data)));
              break;
            }
            case 'error': {
              done(new Error(json.message));
              break;
            }
            default: {
              done(new Error('json.status expected to be success | fail | error'));
              break;
            }
          }
        }
      });
  });

  it('should delete a task', (done) => {
    agent
      .delete(`/api/admin/tasks/${taskId}`)
      .end((error, res) => {
        if (error) return done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          switch (json.status) {
            case 'success': {
              should.exist(json.data.numRemoved);
              should.equal(json.data.numRemoved, 1);
              should.equal(res.status, 200);
              done();
              break;
            }
            case 'fail': {
              done(new Error(JSON.stringify(json.data)));
              break;
            }
            case 'error': {
              done(new Error(json.message));
              break;
            }
            default: {
              done(new Error('json.status expected to be success | fail | error'));
              break;
            }
          }
        }
      });
  });
});

/* describe('User Api', () => {
  const agent = chai.request.agent(domain);
  const userCreditals = {
    name: secret.admin.username,
    password: secret.admin.password,
  };
  let mainCategoryId: string;
  let mainTaskId: string;

  before((done) => {
    agent
      .post('/api/login')
      .type('form')
      .send(userCreditals)
      .end((error, res) => {
        if (error) return done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          switch (json.status) {
            case 'success': {
              agent
                .post('/api/admin/categories')
                .type('form')
                .send({
                  name: 'New Category',
                })
                .end((error, res) => {
                  if (error) done(error);

                  let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
                  try {
                    json = JSON.parse(res.text);
                  } catch (error) {
                    done(error);
                  } finally {
                    mainCategoryId = json.data.category._id;
                    agent
                      .post('/api/admin/categories')
                      .type('form')
                      .send({
                        name: 'New Category',
                      })
                      .end((error, res) => {
                        if (error) done(error);

                        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
                        try {
                          json = JSON.parse(res.text);
                        } catch (error) {
                          done(error);
                        } finally {
                          mainCategoryId = json.data.category._id;
                        }

                        agent
                          .post('/api/admin/tasks')
                          .type('form')
                          .send({
                            name: 'New Task',
                            content: 'Task Content',
                            flag: 'MoeCTF{Borb Borb}',
                            points: 10,
                            categoryId: mainCategoryId,
                          })
                          .end((error, res) => {
                            if (error) return done(error);

                            let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
                            try {
                              json = JSON.parse(res.text);
                            } catch (error) {
                              done(error);
                            } finally {
                              switch (json.status) {
                                case 'success': {
                                  mainTaskId = json.data.task._id;
                                  done();
                                  break;
                                }
                                case 'fail': {
                                  done(new Error(JSON.stringify(json.data)));
                                  break;
                                }
                                case 'error': {
                                  done(new Error(json.message));
                                  break;
                                }
                                default: {
                                  done(new Error('json.status expected to be success | fail | error'));
                                  break;
                                }
                              }
                            }
                          });
                      });
                  }
                });
              break;
            }
            case 'fail': {
              done(new Error(json.data.message));
              break;
            }
            case 'error': {
              done(new Error(json.message));
              break;
            }
            default: {
              done(new Error('json.status expected to be success | fail | error'));
              break;
            }
          }
        }
      });
  });

  after((done) => {
    agent.close();
    db.categories.remove({ _id: mainCategoryId }, {}, () => {
      db.tasks.remove({ _id: mainTaskId }, {}, done);
    });
  });

  it('should submits the flag', (done) => {
    agent
      .post('/api/submit')
      .type('form')
      .send({
        name: 'New Task',
        content: 'Task Content',
        flag: 'MoeCTF{Borb Borb}',
        points: 10,
        categoryId: mainCategoryId,
      })
      .end((error, res) => {
        if (error) return done(error);

        let json: Response = { data: null, status: 'error', message: 'Unknown error has happened' };
        try {
          json = JSON.parse(res.text);
        } catch (error) {
          done(error);
        } finally {
          switch (json.status) {
            case 'success': {
              should.exist(json.data);
              should.exist(json.data.task);
              should.exist(json.data.task._id);
              should.exist(json.data.task.name);
              should.equal(json.data.task.name, 'New Task');
              should.equal(res.status, 201);
              done();
              break;
            }
            case 'fail': {
              done(new Error(JSON.stringify(json.data)));
              break;
            }
            case 'error': {
              done(new Error(json.message));
              break;
            }
            default: {
              done(new Error('json.status expected to be success | fail | error'));
              break;
            }
          }
        }
      });
  });
}); */

/* // eslint-disable-next-line dot-notation
nextServer['close']().then(() => {
  httpServer.close(done);
}); */
