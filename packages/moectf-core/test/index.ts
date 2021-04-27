import express from 'express';
import chai from 'chai';
import chaiHttp from 'chai-http';
import crypto from 'crypto';
import fs from 'fs';
import { Server } from 'http';
import path from 'path';
import start from '../src/app';
import { parse, Response } from '../src/utils/response';

chai.use(chaiHttp);
const should = chai.should();
const moe = start(express());
const { config, db } = moe;
const host = config.hostname + (config.port ? `:${config.port}` : '');
const domain = `${config.protocol}//${host}`;
const userCreditals = {
  name: 'test_username',
  email: 'test_username@gmail.com',
  password: 'user_password_test',
  password2: 'user_password_test',
};

const test = (response: Response, callback?: (r: Response) => void): Error | null | void => {
  switch (response.status) {
    case 'success': {
      return callback ? callback(response) : null;
    }
    case 'fail': {
      return new Error(JSON.stringify(response.data));
    }
    case 'error': {
      return new Error(response.message);
    }
  }
};

let server: Server;

describe('Basic MoeAPI testing', () => {
  let mainCategoryId: string;

  before((done) => {
    server = moe.server.listen({
      host: config.hostname,
      port: config.port,
      exclusive: true,
    }, done);

    db.users.findOne({ name: config.adminCreditals.username }, (err, user) => {
      if (err) return done(err);
      if (!user) {
        db.users.insert({
          name: config.adminCreditals.username,
          password: crypto.pbkdf2Sync(config.adminCreditals.password, config.secret, 1, 32, 'sha512').toString('hex'),
          email: config.adminCreditals.email,
          admin: true,
          avatar: null,
          content: null,
        });
      }
    });
  });

  after((done) => {
    server.close(done);
  });

  describe('User Authorization API', () => {
    let agent: ChaiHttp.Agent;

    before((done) => {
      agent = chai.request.agent(domain).keepOpen();
      done();
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

          done(test(parse(res.text), (r) => {
            should.exist(r.data.user);
            should.equal(res.status, 201);
          }));
        });
    });

    it('should logout from account', function i(done) {
      this.timeout(10000);

      agent
        .get('/api/logout')
        .end((error, res) => {
          if (error) return done(error);

          done(test(parse(res.text), (r) => {
            should.equal(res.status, 200);
          }));
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

          done(test(parse(res.text), (r) => {
            should.exist(r.data.user);
            should.equal(res.status, 200);
          }));
        });
    });
  });

  describe('Admin Api', () => {
    const agent = chai.request.agent(domain);
    const userCreditals = {
      name: config.adminCreditals.username,
      password: config.adminCreditals.password,
    };

    before((done) => {
      db.categories.insert({ name: 'Something upon for testing' }, (err, category: any) => {
        mainCategoryId = category._id;

        agent
          .post('/api/login')
          .type('form')
          .send(userCreditals)
          .end((error, res) => {
            if (error) return done(error);

            done(test(parse(res.text)));
          });
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

          done(test(parse(res.text), (r) => {
            should.exist(r.data.category);
            should.exist(r.data.category._id);
            should.exist(r.data.category.name);
            should.equal(r.data.category.name, 'New Category');
            should.equal(res.status, 201);
            categoryId = r.data.category._id;
          }));
        });
    });

    it('should delete a category', (done) => {
      agent
        .delete(`/api/admin/categories/${categoryId}`)
        .end((error, res) => {
          if (error) return done(error);

          done(test(parse(res.text), (r) => {
            should.exist(r.data.numRemoved);
            should.equal(r.data.numRemoved, 1);
            should.equal(res.status, 200);
          }));
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

          done(test(parse(res.text), (r) => {
            should.exist(r.data.post);
            should.exist(r.data.post._id);
            should.exist(r.data.post.name);
            should.equal(r.data.post.name, 'New Post');
            should.equal(res.status, 201);
            postId = r.data.post._id;
          }));
        });
    });

    it('should delete a post', (done) => {
      agent
        .delete(`/api/admin/posts/${postId}`)
        .end((error, res) => {
          if (error) return done(error);

          done(test(parse(res.text), (r) => {
            should.exist(r.data.numRemoved);
            should.equal(r.data.numRemoved, 1);
            should.equal(res.status, 200);
          }));
        });
    });

    let taskId: string;
    it('should create a new task', (done) => {
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

          done(test(parse(res.text), (r) => {
            should.exist(r.data.task);
            should.exist(r.data.task._id);
            should.exist(r.data.task.name);
            should.equal(r.data.task.name, 'New Task');
            should.equal(res.status, 201);
            taskId = r.data.task._id;
          }));
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

          done(test(parse(res.text), (r) => {
            should.exist(r.data.task);
            should.exist(r.data.task._id);
            should.not.equal(r.data.task.name, 'New Task');
            should.equal(r.data.task.content, 'Task Content');
            should.not.equal(r.data.task.flag, 'MoeCTF{Borb Borb}');
            should.not.equal(r.data.task.points, 10);
            should.equal(r.data.task.categoryId, mainCategoryId);
            should.equal(res.status, 200);
            taskId = r.data.task._id;
          }));
        });
    });

    it('should update a task WITH a first file', (done) => {
      agent
        .put(`/api/admin/tasks/${taskId}`)
        .type('form')
        .attach('file', fs.readFileSync(path.resolve('./', 'test/static/nyan.png')), 'nyan.png')
        .end((error, res) => {
          if (error) return done(error);

          done(test(parse(res.text), (r) => {
            should.exist(r.data.task);
            should.exist(r.data.task._id);
            should.not.equal(r.data.task.name, 'New Task');
            should.equal(r.data.task.content, 'Task Content');
            should.not.equal(r.data.task.flag, 'MoeCTF{Borb Borb}');
            should.not.equal(r.data.task.points, 10);
            should.exist(r.data.task.file);
            should.equal(r.data.task.categoryId, mainCategoryId);
            should.equal(res.status, 200);
            taskId = r.data.task._id;
          }));
        });
    });

    it('should update a task WITH a second file', (done) => {
      agent
        .put(`/api/admin/tasks/${taskId}`)
        .type('form')
        .attach('file', fs.readFileSync(path.resolve('./', 'test/static/code.txt')), 'code.txt')
        .end((error, res) => {
          if (error) return done(error);

          done(test(parse(res.text), (r) => {
            should.exist(r.data.task);
            should.exist(r.data.task._id);
            should.not.equal(r.data.task.name, 'New Task');
            should.equal(r.data.task.content, 'Task Content');
            should.not.equal(r.data.task.flag, 'MoeCTF{Borb Borb}');
            should.not.equal(r.data.task.points, 10);
            should.not.equal(r.data.task.file, `./${config.staticDir}/${'nyan.png'.split(' ').join('_')}`);
            should.equal(r.data.task.categoryId, mainCategoryId);
            should.equal(res.status, 200);
            taskId = r.data.task._id;
          }));
        });
    });

    it('should delete a task', (done) => {
      agent
        .delete(`/api/admin/tasks/${taskId}`)
        .end((error, res) => {
          if (error) return done(error);

          done(test(parse(res.text), (r) => {
            should.exist(r.data.numRemoved);
            should.equal(r.data.numRemoved, 1);
            should.equal(res.status, 200);
          }));
        });
    });
  });

  describe('User Api', () => {
    const agent = chai.request.agent(domain);
    let taskId: string;

    before((done) => {
      db.tasks.insert({
        name: 'New Task',
        content: 'Task Content',
        flag: 'MoeCTF{Borb Borb}',
        points: 10,
        categoryId: mainCategoryId,
        solved: [],
      }, (error, task: any) => {
        if (error) done(error);

        taskId = task._id;

        agent
          .post('/api/login')
          .type('form')
          .send(userCreditals)
          .end((error, res) => {
            if (error) return done(error);

            done(test(parse(res.text)));
          });
      });
    });

    after((done) => {
      agent.close();
      db.users.remove({ name: userCreditals.name }, {}, (err) => {
        if (err) done(err);

        db.tasks.remove({ _id: taskId }, {}, done);
      });
    });

    it('should get a list of tasks', (done) => {
      agent
        .get('/api/tasks')
        .end((error, res) => {
          if (error) done(error);
          done(test(parse(res.text), (r) => {
            should.exist(r.data.tasks);
            should.equal(res.status, 200);
          }));
        });
    });

    it('should get a list of users', (done) => {
      agent
        .get('/api/users')
        .end((error, res) => {
          if (error) done(error);
          done(test(parse(res.text), (r) => {
            should.exist(r.data.users);
            should.equal(res.status, 200);
          }));
        });
    });

    it('should get a list of posts', (done) => {
      agent
        .get('/api/posts')
        .end((error, res) => {
          if (error) done(error);
          done(test(parse(res.text), (r) => {
            should.exist(r.data.posts);
            should.equal(res.status, 200);
          }));
        });
    });

    it('should get a list of categories', (done) => {
      agent
        .get('/api/categories')
        .end((error, res) => {
          if (error) done(error);
          done(test(parse(res.text), (r) => {
            should.exist(r.data.categories);
            should.equal(res.status, 200);
          }));
        });
    });

    it('should get a task', (done) => {
      agent
        .get(`/api/tasks/${taskId}`)
        .end((error, res) => {
          if (error) done(error);
          done(test(parse(res.text), (r) => {
            should.exist(r.data.task);
            should.exist(r.data.task._id);
            should.equal(r.data.task._id, taskId);
            should.equal(res.status, 200);
          }));
        });
    });

    it('should submit a wrong flag on task', (done) => {
      agent
        .post('/api/submit')
        .type('form')
        .send({
          taskId,
          flag: 'MoeCTF{Wrong Flag lol}',
        })
        .end((error, res) => {
          if (error) done(error);
          done(test(parse(res.text), (r) => {
            should.exist(r.data.message);
            should.equal(res.status, 200);
          }));
        });
    });

    it('should submit a right flag on task', (done) => {
      agent
        .post('/api/submit')
        .type('form')
        .send({
          taskId,
          flag: 'MoeCTF{Borb Borb}',
        })
        .end((err, res) => {
          if (err) done(err);
          done(test(parse(res.text), (r) => {
            should.not.exist(r.data.message);
            should.exist(r.data.date);
            should.equal(res.status, 200);
          }));
        });
    });
  });
});
