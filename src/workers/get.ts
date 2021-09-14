import { Controller } from '../models/database';
import response, { Response } from '../utils/response';
import { User } from '../models';

const users = (db) => async (): Promise<Response> => {
  const res = await new Promise<Response>((resolve) => (
    db.users.find({}, { password: 0, email: 0 }, (error: Error, users: any[]) => {
      if (error) {
        resolve(response.error('Server shutdowns due to internal critical error'));
      }

      resolve(response.success({ users }));
    })
  ));

  return res;
};

const profile = (db) => async (req): Promise<Response> => {
  const user = req.user as User;

  const res = await new Promise<Response>((resolve) => (
    db.users.find({ _id: user?._id }, { password: 0, email: 0 }, (error: Error, profile: any) => {
      if (error) {
        resolve(response.error('Server shutdowns due to internal critical error'));
      }

      resolve(response.success({ profile }));
    })
  ));

  return res;
};

const posts = (db) => async (): Promise<Response> => {
  const res = await new Promise<Response>((resolve) => (
    db.posts.find({}).sort({ date: 1 }).exec((error: Error, posts: any[]) => {
      if (error) {
        resolve(response.error('Server shutdowns due to internal critical error'));
      }

      resolve(response.success({ posts }));
    })
  ));

  return res;
};

const categories = (db) => async (): Promise<Response> => {
  const res = await new Promise<Response>((resolve) => (
    db.categories.find({}, (error: Error, categories: any[]) => {
      if (error) {
        resolve(response.error('Server shutdowns due to internal critical error'));
      }

      resolve(response.success({ categories }));
    })
  ));

  return res;
};

const tasks = (db) => async (): Promise<Response> => {
  const res = await new Promise<Response>((resolve) => (
    db.tasks.find({}, { flag: 0 }, (error: Error, tasks: any[]) => {
      if (error) {
        resolve(response.error('Server shutdowns due to internal critical error'));
      }

      resolve(response.success({ tasks }));
    })
  ));

  return res;
};

const task = (db) => async (req): Promise<Response> => {
  const { _id } = req.params;

  const res = await new Promise<Response>((resolve) => (
    db.tasks.findOne({ _id }, { flag: 0 }, (error: Error, task: any) => {
      if (error) {
        resolve(response.error('Server shutdowns due to internal critical error'));
      }

      resolve(response.success({ task }));
    })
  ));

  return res;
};

export default {
  users,
  profile,
  posts,
  categories,
  tasks,
  task,
};
