import crypto from 'crypto';
import moment from 'moment';
import { Config, Database } from 'src/models';
import {
  Scoreboard,
  SolvedTask,
  ScoreboardUser,
  UnitId,
  Task,
  User,
} from '../models/units';
import getFuncs from './get';

type RegisterParams = {
  name: string;
  password: string;
  email: string;
};

const release = (db: Database, config: Config) => ({
  login: async (name: string, password: string): Promise<User | null> => {
    const user = await db.users.findOne<User>({ name });
    if (user) {
      const passHash = crypto
        .pbkdf2Sync(password, config.secret, 1, 32, 'sha512')
        .toString('hex');
      if (user?.password == passHash) return user;
    }

    return null;
  },
  register: async ({ name, password, email }: RegisterParams): Promise<User | null> => {
    const data = await db.users.findOne<User>({
      $or: [{ name }, { email }],
    });

    if (data) return null; // 'User with this creditals already exists',
    const derviedKey = crypto
      .pbkdf2Sync(password, config.secret, 1, 32, 'sha512')
      .toString('hex');
    const newUser: User = await db.users.insert({
      name,
      email,
      password: derviedKey,
      admin: false,
    });

    return newUser;
  },
  taskSubmit: async (
    userId: string,
    taskId: string,
    flag: string,
  ): Promise<boolean> => {
    const task = await db.tasks.findOne<Task>({ _id: taskId });

    if (!task) {
      // res.status(404).json(response.fail({ flag: `Task with ${taskId} id is not exist` }));
      return false;
    }

    if (task.solved[userId]) {
      // res.status(409).json(response.fail({ flag: `Task with ${taskId} id already has been solved` }));
      return false;
    }

    const hashedFlag = crypto
      .pbkdf2Sync(flag, config.secret, 1, 32, 'sha512')
      .toString('hex');

    const date = moment().valueOf();
    // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (task.flag != hashedFlag) {
      // res.status(200).json(response.fail({ flag: 'Flag is invalid' }));
      return false;
    }

    await db.tasks.update(
      { _id: task._id },
      { $set: { [`solved.${userId}`]: date } },
      { returnUpdatedDocs: true, multi: false },
    );

    return true;
  },
});

export default release;
