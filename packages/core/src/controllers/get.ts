/* eslint-disable @typescript-eslint/no-misused-promises */
import { RequestHandler } from 'express';
import { z } from 'zod';
import { Config, Database } from '../models';
import response from '../utils/response';
import { getFuncs } from '../funcs';

const postsSchema = z.object({
  start: z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (!v) return;

      const parsed = parseInt(v, 10);
      if (Number.isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Not a number',
        });
      }
      return parsed;
    }),
  limit: z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (!v) return;

      const parsed = parseInt(v, 10);
      if (Number.isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Not a number',
        });
      }
      return parsed;
    }),
});

const idSchema = z
  .object({
    _id: z.string(),
  })
  .refine(({ _id }) => !!_id, { message: '_id is required' });

const release = (db: Database, config: Config) => {
  const get = getFuncs(db);

  const users: RequestHandler = async (_, res): Promise<void> => {
    try {
      const docs = await get.users();
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

  const profile: RequestHandler = (req, res) => {
    const doc = get.profile(req.user);

    res.status(200).json(response.success({ user: doc }));
  };

  const posts: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { start, limit } = postsSchema.parse(req.query);
      const docs = await get.posts(start, limit);
      res.status(200).json(response.success({ posts: docs }));
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

  const post: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { _id } = idSchema.parse(req.params);
      const doc = await get.post(_id);

      res.status(200).json(response.success({ post: doc }));
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

  const tasks: RequestHandler = async (req, res): Promise<void> => {
    try {
      const docs = await get.tasks();

      res.status(200).json(response.success({ tasks: docs }));
    } catch (error) {
      res
        .status(500)
        .json(
          response.error('Server shutdowns due to internal critical error'),
        );
      console.log(error);
    }
  };

  const task: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { _id } = idSchema.parse(req.params);
      const doc = await get.task(_id);

      res.status(200).json(response.success({ task: doc }));
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

  const scoreboard: RequestHandler = async (req, res): Promise<void> => {
    try {
      const doc = (await get.cache()).scoreboard;
      res.status(200).json(response.success({ scoreboard: doc }));
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
    users,
    profile,
    posts,
    post,
    tasks,
    task,
    scoreboard,
  };
};

export default release;
