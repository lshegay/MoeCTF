import { UploadedFile } from 'express-fileupload';
import crypto from 'crypto';
import fs from 'fs';
import { omitBy, trimStart, trimEnd, isNil } from 'lodash';
import { Config, Post, Task, Unit, User } from '../models';
import { Database } from '../models/database';

type CreateTaskParams = {
  name: string;
  content: string;
  flag: string;
  tags: string[];
  points: number;
  uploadedFile?: UploadedFile;
};

const release = (db: Database, config: Config) => ({
  createPost: async (name: string, content: string): Promise<Post> =>
    db.posts.insert({ name, content, date: Date.now() }),
  updatePost: async (
    _id: string,
    name?: string,
    content?: string,
  ): Promise<Post> =>
    db.posts.update(
      { _id },
      { $set: omitBy({ name, content }, isNil) },
      { returnUpdatedDocs: true, multi: false },
    ),
  deletePost: async (_id: string): Promise<number> =>
    db.posts.remove({ _id }, {}),
  createTask: async ({
    name,
    content,
    flag,
    tags,
    points,
    uploadedFile,
  }: CreateTaskParams): Promise<Task> => {
    const trimmedStaticDir = trimStart(trimEnd(config.staticDir, '/'), '/');
    let file: string | null = null;

    if (uploadedFile) {
      file = `/${trimmedStaticDir}/${uploadedFile.name.split(' ').join('_')}`;
      const filePath = `.${file}`;
      if (!fs.existsSync(`./${trimmedStaticDir}`)) {
        fs.mkdirSync(`./${trimmedStaticDir}`, { recursive: true });
      }
      await uploadedFile.mv(filePath);
    }

    const hashedFlag = crypto
      .pbkdf2Sync(flag, config.secret, 1, 32, 'sha512')
      .toString('hex');

    return db.tasks.insert<Omit<Task, '_id'>>({
      name,
      tags,
      content,
      points,
      flag: hashedFlag,
      ...(file ? { file } : {}),
      solved: {},
    });
  },
  updateTask: async ({
    _id,
    name,
    content,
    flag,
    tags,
    points,
    uploadedFile,
  }: Partial<CreateTaskParams> & Unit) => {
    const trimmedStaticDir = trimStart(trimEnd(config.staticDir, '/'), '/');
    let file: string | null = null;

    if (uploadedFile) {
      file = `/${trimmedStaticDir}/${uploadedFile.name.split(' ').join('_')}`;
      const filePath = `.${file}`;
      if (!fs.existsSync(`./${trimmedStaticDir}`)) {
        fs.mkdirSync(`./${trimmedStaticDir}`, { recursive: true });
      }
      await uploadedFile.mv(filePath);
    }

    let hashedFlag: string | null = null;
    if (flag?.length) {
      hashedFlag = crypto
        .pbkdf2Sync(flag, config.secret, 1, 32, 'sha512')
        .toString('hex');
    }

    const task: Task = await db.tasks.update(
      { _id },
      {
        $set: omitBy(
          {
            name,
            tags,
            content,
            points,
            flag: hashedFlag,
            file,
          },
          isNil,
        ),
      },
      { returnUpdatedDocs: true, multi: false },
    );

    return task;
  },
  deleteTask: async (_id: string): Promise<number> =>
    db.tasks.remove({ _id }, {}),
  users: async (): Promise<User[]> => db.users.find<User>({}, { password: 0 }),
  deleteUser: async (_id: string): Promise<number> =>
    db.users.remove({ _id }, {}),
});

export default release;
