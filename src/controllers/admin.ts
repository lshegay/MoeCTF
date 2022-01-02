import { UploadedFile } from 'express-fileupload';
import crypto from 'crypto';
import fs from 'fs';
import { identity } from 'lodash';
import pickBy from 'lodash/pickBy';
import trimStart from 'lodash/trimStart';
import trimEnd from 'lodash/trimEnd';
import isEmpty from 'lodash/isEmpty';
import { Post, Task } from '../models';
import { Controller } from '../models/database';
import response, { projection } from '../utils/response';

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

const updatePost: Controller = (db) => async (req, res): Promise<void> => {
  const { _id } = req.params;
  const { name, content } = req.body;

  try {
    const post: Post = await db.posts.update(
      { _id },
      { $set: pickBy({ name, content }) },
      { returnUpdatedDocs: true, multi: false }
    );
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
    tags: freshTags,
  } = req.body;
  const uploadedFile = req.files?.file as UploadedFile;

  if (Array.isArray(uploadedFile)) {
    res.status(400).json(response.fail({ file: 'You can upload only one file per task' }));
    return;
  }

  if (isEmpty(name)
    || isEmpty(req.body.points)
    || isEmpty(flag)) {
    res.status(400).json(response.fail(projection({
      name: 'A name is required',
      points: 'Points is required',
      flag: 'Flag is required',
    }, { name: isEmpty(name), points: isEmpty(req.body.points), flag: isEmpty(flag) })));
    return;
  }

  if (typeof content != 'string') {
    res.status(400).json(response.fail({ content: 'Content should be string' }));
    return;
  }

  if (typeof flag != 'string') {
    res.status(400).json(response.fail({ flag: 'Flag should be string' }));
    return;
  }

  let tags: string[] = freshTags;

  if (!Array.isArray(freshTags)) {
    try {
      const parsedTags = JSON.parse(freshTags);
      tags = parsedTags;
    } catch (error) {
      res.status(400).json(response.fail({ tags: 'Tags should be an array of string or at least stringified array' }));
      return;
    }
  }

  const points = Number.parseInt(req.body.points, 10);

  if (!points) {
    res.status(400).json(response.fail({
      points: 'Points should be number',
    }));
    return;
  }

  try {
    const trimmedStaticDir = trimStart(trimEnd(config.staticDir, '/'), '/');
    let file = '';

    if (uploadedFile) {
      file = `/${trimmedStaticDir}/${uploadedFile.name.split(' ').join('_')}`;
      const filePath = `.${file}`;
      if (!fs.existsSync(`./${trimmedStaticDir}`)) {
        fs.mkdirSync(`./${trimmedStaticDir}`, { recursive: true });
      }
      await uploadedFile.mv(filePath);
    }

    const hashedFlag = crypto.pbkdf2Sync(flag, config.secret, 1, 32, 'sha512').toString('hex');

    const task: Task = await db.tasks.insert({
      name, tags, content, points, flag: hashedFlag, ...(uploadedFile ? { file } : {}), solved: {},
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
    tags: freshTags,
  } = req.body;
  const uploadedFile = req.files?.file as UploadedFile;

  if (Array.isArray(uploadedFile)) {
    res.status(400).json(response.fail({ file: 'You can upload only one file per task' }));
    return;
  }

  const points = req.body.points
    ? Number.parseInt(req.body.points, 10)
    : null;

  if (points != null && !Number.isInteger(points)) {
    res.status(400).json(response.fail({
      points: 'Points have to be number',
    }));
    return;
  }

  if (typeof content != 'string') {
    res.status(400).json(response.fail({ content: 'Content should be string' }));
    return;
  }

  let tags = freshTags;

  if (!Array.isArray(freshTags)) {
    try {
      const parsedTags = JSON.parse(freshTags);
      tags = parsedTags;
    } catch (error) {
      res.status(400).json(response.fail({ tags: 'Tags should be an array of string or at least stringified array' }));
      return;
    }
  }

  try {
    const trimmedStaticDir = trimStart(trimEnd(config.staticDir, '/'), '/');
    let file = '';

    if (uploadedFile) {
      file = `/${trimmedStaticDir}/${uploadedFile.name.split(' ').join('_')}`;
      const filePath = `.${file}`;
      if (!fs.existsSync(`./${trimmedStaticDir}`)) {
        fs.mkdirSync(`./${trimmedStaticDir}`, { recursive: true });
      }
      await uploadedFile.mv(filePath);
    }

    let hashedFlag: string | null = null;
    if (!isEmpty(flag)) {
      hashedFlag = crypto.pbkdf2Sync(flag, config.secret, 1, 32, 'sha512').toString('hex');
    }

    const task: Task = await db.tasks.update(
      { _id },
      { $set: pickBy({
        name, tags, content, points, flag: hashedFlag, ...(uploadedFile ? { file } : {}),
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
    post: createPost,
    task: createTask,
  },
  deletes: {
    post: deletePost,
    task: deleteTask,
  },
  updates: {
    task: updateTask,
    post: updatePost,
  }
};
