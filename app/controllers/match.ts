import {
  Request,
  Response,
  NextFunction
} from 'express';

import User from '../models/user';
import config from '../settings/config';

export const isNotMatchEnded = (req: Request, res: Response, next: NextFunction): void => {
  const currentDate: Date = new Date(Date.now());

  if (!config.timer
    || (config.timer && config.endMatchDate && currentDate < new Date(config.endMatchDate))
    || (req.isAuthenticated() && (req.user as User).admin)) {
    return next();
  }

  req.flash('error', 'Match has been already finished');
  return res.redirect(req.headers.referer || '/');
};

export const isMatchStarted = (req: Request, res: Response, next: NextFunction): void => {
  const currentDate: Date = new Date(Date.now());

  if (!config.timer
    || (config.timer && config.startMatchDate && currentDate >= new Date(config.startMatchDate))
    || (req.isAuthenticated() && (req.user as User).admin)) {
    return next();
  }
  res.status(403).redirect('/');
};
