/* eslint-disable @typescript-eslint/no-misused-promises */
import crypto from 'crypto';
import { RequestHandler } from 'express';
import moment from 'moment';
import path from 'path';
import { Config, Database } from 'src/models';
import { z } from 'zod';
import { updateFuncs, userFuncs } from '../funcs';
import { Task, User } from '../models/units';
import response, { projection, Response } from '../utils/response';

const loginSchema = z.object({
  name: z.string(),
  password: z.string(), // TODO: trail spaces
});

const registerSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(), // TODO: trail spaces
    password2: z.string(), // TODO: trail spaces
  })
  .refine(
    ({ password, password2 }) => password == password2,
    'Passwords are required to be identical',
  );

const taskSubmitSchema = z.object({
  taskId: z.string(),
  flag: z.string().transform((v) => v.trim().replace('\n', '')),
  userId: z.string(),
});

const release = (db: Database, config: Config) => {
  const update = updateFuncs(db, config);
  const user = userFuncs(db, config);

  const isAuthenticated: RequestHandler = (req, res, next): void => {
    if (req.isAuthenticated()) {
      return next();
    }
    res
      .status(401)
      .json(response.fail({ auth: 'User should be authenticated' }));
  };

  const isNotAuthenticated: RequestHandler = (req, res, next): void => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res
      .status(403)
      .json(response.fail({ auth: 'User is authenticated already' }));
  };

  const isAdmin: RequestHandler = (req, res, next): void => {
    if ((req.user as User).admin) {
      return next();
    }
    res.status(403).json(
      response.fail({
        auth: 'User does not have enough privileges to do this',
      }),
    );
  };

  const login: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { name, password } = loginSchema.parse(req.body);

      const doc = await user.login(name, password);

      if (doc) {
        req.login(doc, (error) => {
          if (error) {
            res
              .status(500)
              .json(response.error('Server got an internal critical error'));
            throw error;
          }
          const { password: _, ...resUser } = doc;
          res.status(200).json(response.success({ user: resUser }));
        });
      } else {
        res.status(401).json(
          response.fail({
            password:
              'Incorrect credentials. Verify your username and password and try again',
          }),
        );
      }
    } catch (error) {
      res
        .status(500)
        .json(response.error('Server got an internal critical error'));
      console.log(error);
    }
  };

  const logout: RequestHandler = (req, res): void => {
    req.logout();
    res.status(200).json(response.success());
  };

  const register: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { name, email, password } = registerSchema.parse(req.body);

      const newUser = await user.register({ name, email, password });
      if (newUser) {
        req.login(newUser, (error: Error) => {
          if (error) {
            res
              .status(500)
              .json(response.error('Server got an internal critical error'));
            console.log(error);
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password: _, ...doc } = newUser;
          res.status(201).json(response.success({ user: doc }));
        });
      } else {
        // TODO: 'User with this creditals already exists',
      }
    } catch (error) {
      res
        .status(500)
        .json(response.error('Server got an internal critical error'));
      console.log(error);
    }
  };

  const taskSubmit: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { userId, taskId, flag } = taskSubmitSchema.parse({
        ...req.body,
        userId: req.user?._id,
      });
      const result = await user.taskSubmit(userId, taskId, flag);
      if (result) {
        await update.scoreboard();
      }
      res.status(200).json(response.success({ result }));
    } catch (error) {
      res
        .status(500)
        .json(response.error('Server got an internal critical error'));
      throw error;
    }
  };
  return {
    is: {
      authenticated: isAuthenticated,
      admin: isAdmin,
      not: {
        authenticated: isNotAuthenticated,
      },
    },
    submits: taskSubmit,
    logins: login,
    logouts: logout,
    registers: register,
  };
};

export default release;
