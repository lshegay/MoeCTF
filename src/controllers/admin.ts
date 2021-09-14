import { UploadedFile } from 'express-fileupload';
import fs from 'fs';
import { identity } from 'lodash';
import pickBy from 'lodash/pickBy';
import { Category, Post, Task } from '../models';
import { Controller } from '../models/database';
import response, { projection } from '../utils/response';

const createCategory: Controller = (db) => async (req, res): Promise<void> => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json(response.fail({
      name: 'A name is required',
    }));
    return;
  }

  try {
    const category: Category = await db.categories.insert({ name });
    res.status(201).json(response.success({ category }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.error(error);
  }
};

const deleteCategory: Controller = (db) => async (req, res): Promise<void> => {
  const { _id } = req.params;

  if (!_id) {
    res.status(400).json(response.fail({ _id: 'A query is required' }));
    return;
  }

  try {
    await db.tasks.remove({ categoryId: _id }, { multi: true });
    const numRemoved = await db.categories.remove({ _id }, {});

    res.status(200).json(response.success({ numRemoved }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.error(error);
  }
};

const createPost: Controller = (db) => async (req, res): Promise<void> => {
  const { name, content } = req.body;

  try {
    const post: Post = await db.posts.insert({ name, content, date: Date.now() });
    res.status(201).json(response.success({ post }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.error(error);
  }
};

const deletePost: Controller = (db) => async (req, res): Promise<void> => {
  const { _id } = req.params;

  if (!_id) {
    res.status(400).json(response.fail({ _id: 'A query is required' }));
    return;
  }

  try {
    const numRemoved = await db.posts.remove({ _id }, {});
    res.status(200).json(response.success({ numRemoved }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.error(error);
  }
};

const createTask: Controller = (db, config) => async (req, res): Promise<void> => {
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

  try {
    let file = '';

    if (uploadedFile) {
      file = `./${config.staticDir}/${uploadedFile.name.split(' ').join('_')}`;
      if (!fs.existsSync(`./${config.staticDir}`)) {
        fs.mkdirSync(`./${config.staticDir}`, { recursive: true });
      }
      await uploadedFile.mv(file);
    }

    const task: Task = await db.tasks.insert({
      name, categoryId, content, points, flag, ...(uploadedFile ? { file } : {}), solved: {},
    });
    res.status(201).json(response.success({ task }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.error(error);
  }
};

const updateTask: Controller = (db, config) => async (req, res): Promise<void> => {
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

  try {
    let file = '';

    if (uploadedFile) {
      file = `./${config.staticDir}/${uploadedFile.name.split(' ').join('_')}`;
      if (!fs.existsSync(`./${config.staticDir}`)) {
        fs.mkdirSync(`./${config.staticDir}`, { recursive: true });
      }
      await uploadedFile.mv(file);
    }

    const task: Task = await db.tasks.update(
      { _id },
      { $set: pickBy({
        name, categoryId, content, points, flag, ...(uploadedFile ? { file } : {}),
      }, uploadedFile ? identity : undefined) },
      { returnUpdatedDocs: true, multi: false }
    );
    res.status(201).json(response.success({ task }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.error(error);
  }
};

const deleteTask: Controller = (db) => async (req, res): Promise<void> => {
  const { _id } = req.params;

  if (!_id) {
    res.status(400).json(response.fail({ _id: 'A query is required' }));
    return;
  }

  try {
    const numRemoved = await db.tasks.remove({ _id }, {});
    res.status(200).json(response.success({ numRemoved }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.error(error);
  }
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
