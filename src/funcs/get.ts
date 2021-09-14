import { Category, Post, Task, User } from '../models';
import { CacheData, ScoreboardUser } from '../models/units';

const users = async ({ db }): Promise<User[]> => (
  db.users.find({}, { password: 0, email: 0 })
);

const profile = async ({ req }): Promise<User> => (
  req.user as User
);

const posts = async ({ db }): Promise<Post[]> => (
  db.posts.find({}).sort({ date: 1 }).exec()
);

const categories = async ({ db }): Promise<Category[]> => (
  db.categories.find({})
);

const tasks = async ({ db }): Promise<Task[]> => (
  db.tasks.find({}, { flag: 0 })
);

const task = async ({ _id, db }): Promise<Task> => (
  db.tasks.findOne({ _id }, { flag: 0 })
);

const cache = async ({ db }): Promise<CacheData> => {
  const datastore = (db.cache as Datastore);
  let cacheData: CacheData = await datastore.findOne({ name: 'c' });
  if (cacheData == null) {
    cacheData = await datastore.insert({ scoreboard: [], name: 'c' });
  }

  return cacheData;
};

const scoreboard = async ({ db }): Promise<ScoreboardUser[]> => (
  (await cache({ db })).scoreboard
);

export default {
  users,
  profile,
  posts,
  categories,
  tasks,
  task,
  cache,
  scoreboard,
};
