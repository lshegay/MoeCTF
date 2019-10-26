import {
  Request,
  Response,
  NextFunction
} from 'express';

import User from '../../src/models/user';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(403).redirect('/login');
};

export const isNotAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.status(403).redirect('/');
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated() && (req.user as User).admin) {
    return next();
  }
  res.status(403).redirect('/tasks');
};
