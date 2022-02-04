import { Post, Task, User } from '../models';
import { CacheData, Scoreboard } from '../models/units';

const users = async ({ db }): Promise<User[]> => (
  db.users.find({}, { password: 0, email: 0 })
);

const profile = async ({ req }): Promise<User | null> => (
  req.user as (User | null)
);

const posts = async ({ db, start, limit }): Promise<Post[]> => (
  db.posts.find({}).skip(start).limit(limit).sort({ date: -1 })
    .exec()
);

const post = async ({ _id, db }): Promise<Post> => (
  db.posts.findOne({ _id })
);

const tasks = async ({ db }): Promise<Task[]> => (
  db.tasks.find({}, { flag: 0 })
);

const task = async ({ _id, db }): Promise<Task> => (
  db.tasks.findOne({ _id }, { flag: 0 })
);

const cache = async ({ db }): Promise<CacheData> => {
  const datastore = (db.cache as Datastore);
  let cacheData = (await datastore.find<CacheData>({}))[0];
  if (cacheData == null) {
    cacheData = await datastore.insert({ scoreboard: {}, history: {} });
  }

  return cacheData;
};

const scoreboard = async ({ db }): Promise<Scoreboard> => (
  (await cache({ db })).scoreboard
);

export default {
  users,
  profile,
  posts,
  post,
  tasks,
  task,
  cache,
  scoreboard,
};
