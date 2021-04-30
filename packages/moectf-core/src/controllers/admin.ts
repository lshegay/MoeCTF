import { UploadedFile } from 'express-fileupload';
import fs from 'fs';
import { identity } from 'lodash';
import pickBy from 'lodash/pickBy';
import { Category, Post, Task } from '../models';
import { Controller } from '../models/database';
import response, { projection } from '../utils/response';

const createCategory: Controller = (db) => (req, res): void => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json(response.fail({
      name: 'A name is required',
    }));
    return;
  }

  db.categories.insert({ name }, (error: Error, category: Partial<Category>) => {
    if (error) {
      res.status(500).json(response.error('Server shutdowns due to internal critical error'));
      throw error;
    }

    res.status(201).json(response.success({ category }));
  });
};

const deleteCategory: Controller = (db) => (req, res): void => {
  const { _id } = req.params;

  if (!_id) {
    res.status(400).json(response.fail({ _id: 'A query is required' }));
    return;
  }

  db.tasks.remove({ categoryId: _id }, { multi: true }, (error: Error) => {
    if (error) {
      res.status(500).json(response.error('Server shutdowns due to internal critical error'));
      throw error;
    }

    db.categories.remove({ _id }, {}, (error: Error, numRemoved: number) => {
      if (error) {
        res.status(500).json(response.error('Server shutdowns due to internal critical error'));
        throw error;
      }

      res.status(200).json(response.success({ numRemoved }));
    });
  });
};

const createPost: Controller = (db) => (req, res): void => {
  const { name, content } = req.body;

  db.posts.insert({ name, content, date: Date.now() }, (error: Error, post: Partial<Post>) => {
    if (error) {
      res.status(500).json(response.error('Server shutdowns due to internal critical error'));
      throw error;
    }

    res.status(201).json(response.success({ post }));
  });
};

const deletePost: Controller = (db) => (req, res): void => {
  const { _id } = req.params;

  if (!_id) {
    res.status(400).json(response.fail({ _id: 'A query is required' }));
    return;
  }

  db.posts.remove({ _id }, {}, (error: Error, numRemoved: number) => {
    if (error) {
      res.status(500).json(response.error('Server shutdowns due to internal critical error'));
      throw error;
    }

    res.status(200).json(response.success({ numRemoved }));
  });
};

const createTask: Controller = (db, config) => (req, res): void => {
  const {
    name,
    content,
    flag,
    categoryId,
  } = req.body;
  const uploadedFile = req.files?.file as UploadedFile;

  if (!name || !req.body.points || !categoryId) {
    res.status(400).json(response.fail(projection({
      name: 'A name is required',
      points: 'Points is required',
      categoryId: 'A categoryId is required',
    }, { name, points: req.body.points, categoryId })));
    return;
  }

  const points = Number.parseInt(req.body.points, 10);

  if (!points) {
    res.status(400).json(response.fail({
      points: 'Points have to be number',
    }));
    return;
  }

  if (uploadedFile) {
    const file = `./${config.staticDir}/${uploadedFile.name.split(' ').join('_')}`;
    if (!fs.existsSync(`./${config.staticDir}`)) {
      fs.mkdirSync(`./${config.staticDir}`, { recursive: true });
    }
    uploadedFile.mv(file, (error: Error) => {
      if (error) {
        res.status(500).json(response.error('Server shutdowns due to internal critical error'));
        throw error;
      }

      db.tasks.insert({ name, categoryId, content, points, flag, file, solved: [] },
        (error: Error, task: Partial<Task>) => {
          if (error) {
            res.status(500).json(response.error('Server shutdowns due to internal critical error'));
            throw error;
          }

          res.status(201).json(response.success({ task }));
        });
    });
  } else {
    db.tasks.insert({ name, categoryId, content, points, flag, solved: [] },
      (error: Error, task: Partial<Task>) => {
        if (error) {
          res.status(500).json(response.error('Server shutdowns due to internal critical error'));
          throw error;
        }

        res.status(201).json(response.success({ task }));
      });
  }
};

const updateTask: Controller = (db, config) => (req, res): void => {
  const { _id } = req.params;

  if (!_id) {
    res.status(400).json(response.fail({ _id: 'A query is required' }));
    return;
  }

  const {
    name,
    content,
    flag,
    categoryId,
  } = req.body;
  const uploadedFile = req.files?.file as UploadedFile;
  const points = req.body.points
    ? Number.parseInt(req.body.points, 10)
    : null;

  if (points != null && !Number.isInteger(points)) {
    res.status(400).json(response.fail({
      points: 'Points have to be number',
    }));
    return;
  }

  if (uploadedFile) {
    const file = `./${config.staticDir}/${uploadedFile.name.split(' ').join('_')}`;
    if (!fs.existsSync(`./${config.staticDir}`)) {
      fs.mkdirSync(`./${config.staticDir}`, { recursive: true });
    }
    uploadedFile.mv(file, (error: Error) => {
      if (error) {
        res.status(500).json(response.error('Server shutdowns due to internal critical error'));
        throw error;
      }

      db.tasks.update(
        { _id },
        { $set: pickBy({ name, categoryId, content, points, flag, file }, identity) },
        { returnUpdatedDocs: true, multi: false },
        (error: Error, _, task: Task) => {
          if (error) {
            res.status(500).json(response.error('Server shutdowns due to internal critical error'));
            throw error;
          }

          res.status(200).json(response.success({ task }));
        }
      );
    });
  } else {
    db.tasks.update(
      { _id },
      { $set: pickBy({ name, categoryId, content, points, flag }) },
      { returnUpdatedDocs: true, multi: false },
      (error: Error, _, task: Task) => {
        if (error) {
          res.status(500).json(response.error('Server shutdowns due to internal critical error'));
          throw error;
        }

        res.status(200).json(response.success({ task }));
      }
    );
  }
};

const deleteTask: Controller = (db) => (req, res): void => {
  const { _id } = req.params;

  if (!_id) {
    res.status(400).json(response.fail({ _id: 'A query is required' }));
    return;
  }

  db.tasks.remove({ _id }, {}, (error: Error, numRemoved: number) => {
    if (error) {
      res.status(500).json(response.error('Server shutdowns due to internal critical error'));
      throw error;
    }

    res.status(200).json(response.success({ numRemoved }));
  });
};

export default {
  creates: {
    category: createCategory,
    post: createPost,
    task: createTask,
  },
  deletes: {
    category: deleteCategory,
    post: deletePost,
    task: deleteTask,
  },
  updates: {
    task: updateTask,
  }
};
