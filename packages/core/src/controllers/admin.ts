/* eslint-disable @typescript-eslint/no-misused-promises */
import { UploadedFile } from 'express-fileupload';
import { z } from 'zod';
import { RequestHandler } from 'express';
import { Config, Post, User } from '../models';
import { Database } from '../models/database';
import response from '../utils/response';
import { getFuncs, adminFuncs } from '../funcs';

const postSchema = z.object({
  name: z.string(),
  content: z.string(),
});

const idSchema = z
  .object({
    _id: z.string(),
  })
  .refine(({ _id }) => !!_id, { message: '_id is required' });

const taskSchema = z.object({
  name: z.string(),
  content: z.string(),
  flag: z.string().min(1, 'Flag must not be a blank string'),
  points: z.string().transform((v, ctx) => {
    if (!v) return 0;

      const parsed = parseInt(v, 10);
      if (Number.isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Not a number',
        });
      }
      return parsed;
  }),
  tags: z.string().transform((v, ctx) => {
    try {
      const parsedTags = JSON.parse(v) as string[];
      return parsedTags;
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tags should be an array of string or at least stringified array',
      });
    }
    return [];
  }).or(z.array(z.string())),
});

const release = (db: Database, config: Config) => {
  const get = getFuncs(db);
  const admin = adminFuncs(db, config);

  const createPost: RequestHandler = async (req, res): Promise<void> => {
    const { name, content } = postSchema.parse(req.body);

    try {
      const doc: Post = await admin.createPost(name, content);
      res.status(201).json(response.success({ post: doc }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json(response.error(error.message, { errors: error.errors }));
        return;
      }

      res
        .status(500)
        .json(
          response.error('Server shutdowns due to internal critical error'),
        );
      console.log(error);
    }
  };

  const updatePost: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { _id } = idSchema.parse(req.params);
      const { name, content } = postSchema.partial().parse(req.body);

      const post: Post = await admin.updatePost(_id, name, content);
      res.status(201).json(response.success({ post }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json(response.error(error.message, { errors: error.errors }));
        return;
      }

      res
        .status(500)
        .json(
          response.error('Server shutdowns due to internal critical error'),
        );
      console.log(error);
    }
  };

  const deletePost: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { _id } = idSchema.parse(req.params);
      const numRemoved = await admin.deletePost(_id);

      if (numRemoved == 0) {
        res.status(204).json(
          response.fail({
            _id: 'No post was found with such id. Nothing has been deleted',
          }),
        );
        return;
      }

      res.status(200).json(response.success({ numRemoved }));
    } catch (error) {
      res
        .status(500)
        .json(
          response.error('Server shutdowns due to internal critical error'),
        );
      console.log(error);
    }
  };

  const createTask: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { name, content, flag, tags, points } = taskSchema.parse(req.body);
      const uploadedFile = req.files?.file as UploadedFile;

      if (Array.isArray(uploadedFile)) {
        res
          .status(400)
          .json(response.fail({ file: 'You can upload only one file per task' }));
        return;
      }

      const task = await admin.createTask({ name, content, flag, tags, points, uploadedFile })
      res.status(201).json(response.success({ task }));
    } catch (error) {
      res
        .status(500)
        .json(
          response.error('Server shutdowns due to internal critical error'),
        );
      console.log(error);
    }
  };

  const updateTask: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { _id } = idSchema.parse(req.params);

      const { name, content, flag, tags, points } = taskSchema.partial().parse(req.body);
      const uploadedFile = req.files?.file as UploadedFile;

      if (Array.isArray(uploadedFile)) {
        res
          .status(400)
          .json(response.fail({ file: 'You can upload only one file per task' }));
        return;
      }

      const task = await admin.updateTask({ _id, name, content, flag, tags, points, uploadedFile })
      res.status(201).json(response.success({ task }));
    } catch (error) {
      res
        .status(500)
        .json(
          response.error('Server shutdowns due to internal critical error'),
        );
      console.log(error);
    }
  };

  const deleteTask: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { _id } = idSchema.parse(req.params);
      const numRemoved = await admin.deleteTask(_id);

      if (numRemoved == 0) {
        res.status(204).json(
          response.fail({
            _id: 'No task was found with such id. Nothing has been deleted',
          }),
        );
        return;
      }

      res.status(200).json(response.success({ numRemoved }));
    } catch (error) {
      res
        .status(500)
        .json(
          response.error('Server shutdowns due to internal critical error'),
        );
      console.log(error);
    }
  };

  const users: RequestHandler = async (_, res): Promise<void> => {
    try {
      const docs = await admin.users();
      res.status(200).json(response.success({ users: docs }));
    } catch (error) {
      res
        .status(500)
        .json(
          response.error('Server shutdowns due to internal critical error'),
        );
      console.log(error);
    }
  };

  const deleteUser: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { _id } = idSchema.parse(req.params);

      if ((req.user as User)?._id == _id) {
        res.status(400).json(response.fail({ _id: "You can't delete yourself" }));
        return;
      }

      const numRemoved = await admin.deleteUser(_id);

      if (numRemoved == 0) {
        res.status(204).json(
          response.fail({
            _id: 'No user was found with such id. Nothing has been deleted',
          }),
        );
        return;
      }

      res.status(200).json(response.success({ numRemoved }));
    } catch (error) {
      res
        .status(500)
        .json(
          response.error('Server shutdowns due to internal critical error'),
        );
      console.log(error);
    }
  };

  return {
    gets: {
      users,
    },
    creates: {
      post: createPost,
      task: createTask,
    },
    deletes: {
      post: deletePost,
      task: deleteTask,
      user: deleteUser,
    },
    updates: {
      task: updateTask,
      post: updatePost,
    },
  };
};

export default release;
