import {
  Request,
  Response,
  NextFunction
} from 'express';
import moment, { Moment } from 'moment';

import User from '../../src/models/user';
import config from '../config/config';

export const isNotMatchEnded = (req: Request, res: Response, next: NextFunction): void => {
  const currentDate: Moment = moment();

  if (!config.timer
    || (config.timer && currentDate.isBefore(config.endMatchDate))
    || (req.isAuthenticated() && (req.user as User).admin)) {
    return next();
  }

  req.flash('error', 'Match has been already finished');
  return res.redirect(req.headers.referer || '/');
};

export const isMatchStarted = (req: Request, res: Response, next: NextFunction): void => {
  const currentDate: Moment = moment();

  if (!config.timer
    || (config.timer && currentDate.isSameOrAfter(config.startMatchDate))
    || (req.isAuthenticated() && (req.user as User).admin)) {
    return next();
  }
  res.status(403).redirect('/');
};
