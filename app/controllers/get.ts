import { Controller } from '../models/database';
import response from '../utils/response';

const users: Controller = (db) => (_, res): void => {
  db.users.find({}, { password: 0, email: 0 }, (error: Error, users: any[]) => {
    if (error) {
      res.status(500).json(response.error('Server shutdowns due to internal critical error'));
      throw error;
    }

    res.status(200).json(response.success({ users }));
  });
};

const posts: Controller = (db) => (_, res): void => {
  db.posts.find({}).sort({ date: 1 }).exec((error: Error, posts: any[]) => {
    if (error) {
      res.status(500).json(response.error('Server shutdowns due to internal critical error'));
      throw error;
    }

    res.status(200).json(response.success({ posts }));
  });
};

const categories: Controller = (db) => (_, res): void => {
  db.categories.find({}, (error: Error, categories: any[]) => {
    if (error) {
      res.status(500).json(response.error('Server shutdowns due to internal critical error'));
      throw error;
    }

    res.status(200).json(response.success({ categories }));
  });
};

const tasks: Controller = (db) => (_, res): void => {
  db.tasks.find({}, { flag: 0 }, (error: Error, tasks: any[]) => {
    if (error) {
      res.status(500).json(response.error('Server shutdowns due to internal critical error'));
      throw error;
    }

    res.status(200).json(response.success({ tasks }));
  });
};

const task: Controller = (db) => (req, res): void => {
  const { _id } = req.params;

  db.tasks.findOne({ _id }, { flag: 0 }, (error: Error, task: any) => {
    if (error) {
      res.status(500).json(response.error('Server shutdowns due to internal critical error'));
      throw error;
    }

    res.status(200).json(response.success({ task }));
  });
};

export default {
  users,
  posts,
  categories,
  tasks,
  task,
};
