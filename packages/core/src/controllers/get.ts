import { Controller } from '../models/database';
import response from '../utils/response';
import get from '../funcs/get';

const users: Controller = (db) => async (_, res): Promise<void> => {
  try {
    const users = await get.users({ db });
    res.status(200).json(response.success({ users }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.log(error);
  }
};

const profile: Controller = () => async (req, res): Promise<void> => {
  const user = await get.profile({ req });

  res.status(200).json(response.success({ user }));
};

const posts: Controller = (db) => async (req, res): Promise<void> => {
  try {
    const { start, limit } = req.query;
    const posts = await get.posts({ db, start, limit });
    res.status(200).json(response.success({ posts }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.log(error);
  }
};

const post: Controller = (db) => async (req, res): Promise<void> => {
  const { _id } = req.params;

  try {
    const post = await get.post({ db, _id });

    res.status(200).json(response.success({ post }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.log(error);
  }
};

const tasks: Controller = (db) => async (_, res): Promise<void> => {
  try {
    const tasks = await get.tasks({ db });

    res.status(200).json(response.success({ tasks }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.log(error);
  }
};

const task: Controller = (db) => async (req, res): Promise<void> => {
  const { _id } = req.params;

  try {
    const task = await get.task({ db, _id });

    res.status(200).json(response.success({ task }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.log(error);
  }
};

const scoreboard: Controller = (db) => async (_, res): Promise<void> => {
  try {
    const scoreboard = await get.scoreboard({ db });
    res.status(200).json(response.success({ scoreboard }));
  } catch (error) {
    res.status(500).json(response.error('Server shutdowns due to internal critical error'));
    console.log(error);
  }
};

export default {
  users,
  profile,
  posts,
  post,
  tasks,
  task,
  scoreboard,
};
