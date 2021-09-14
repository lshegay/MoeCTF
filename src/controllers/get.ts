import { Controller } from '../models/database';
import response from '../utils/response';
import get from '../funcs/get';

const users: Controller = (db) => async (_, res): Promise<void> => {
  try {
    const users = await get.users({ db });
    res.status(200).json(response.success({ users }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.error(error);
  }
};

const profile: Controller = () => (req, res): void => {
  const user = get.profile({ req });

  res.status(200).json(response.success({ user }));
};

const posts: Controller = (db) => async (_, res): Promise<void> => {
  try {
    const posts = await get.posts({ db });
    res.status(200).json(response.success({ posts }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.error(error);
  }
};

const categories: Controller = (db) => async (_, res): Promise<void> => {
  try {
    const categories = await get.categories({ db });

    res.status(200).json(response.success({ categories }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.error(error);
  }
};

const tasks: Controller = (db) => async (_, res): Promise<void> => {
  try {
    const tasks = await get.tasks({ db });

    res.status(200).json(response.success({ tasks }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.error(error);
  }
};

const task: Controller = (db) => async (req, res): Promise<void> => {
  const { _id } = req.params;

  try {
    const task = await get.task({ db, _id });

    res.status(200).json(response.success({ task }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.error(error);
  }
};

const scoreboard: Controller = (db) => async (_, res): Promise<void> => {
  try {
    const scoreboard = await get.scoreboard({ db });
    res.status(200).json(response.success({ scoreboard }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.error(error);
  }
};

export default {
  users,
  profile,
  posts,
  categories,
  tasks,
  task,
  scoreboard,
};
