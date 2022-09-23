import { Database, Post, Task, User } from '../models';
import { CacheData } from '../models/units';

const release = (db: Database) => ({
  users: async () => db.users.find<User>({}, { password: 0, email: 0 }),
  profile: (user?: User) => user ?? null,
  posts: async (start?: number, limit?: number): Promise<Post[]> => {
    let query = db.posts.find<Post>({});
    if (start) query = query.skip(start);
    if (limit) query = query.limit(limit);
  
    return query.sort({ date: -1 }).exec();
  },
  post: async (_id: string): Promise<Post> => (
    db.posts.findOne({ _id })
  ),
  tasks: async (): Promise<Omit<Task, 'flag'>[]> => (
    db.tasks.find<Task>({}, { flag: 0 })
  ),
  task: async (_id: string): Promise<Omit<Task, 'flag'>> => (
    db.tasks.findOne<Task>({ _id }, { flag: 0 })
  ),
  cache: async (): Promise<CacheData> => {
    const datastore = db.cache;
    let cacheData = (await datastore.find<CacheData>({}))[0];
    if (!cacheData) {
      cacheData = await datastore.insert({ scoreboard: {}, history: {} });
    }

    return cacheData;
  },
});

export default release;
