import { RequestHandler } from 'express';

import { User } from '../models';
import config from '../settings/config';

const isNotEnded: RequestHandler = (req, res, next): void => {
  const currentDate: Date = new Date(Date.now());

  if (!config.timer
    || (config.timer && config.endMatchDate && currentDate < new Date(config.endMatchDate))
    || (req.isAuthenticated() && (req.user as User).admin)) {
    return next();
  }

  req.flash('error', 'Match has been already finished');
  return res.redirect(req.headers.referer || '/');
};

const isStarted: RequestHandler = (req, res, next): void => {
  const currentDate: Date = new Date(Date.now());

  if (!config.timer
    || (config.timer && config.startMatchDate && currentDate >= new Date(config.startMatchDate))
    || (req.isAuthenticated() && (req.user as User).admin)) {
    return next();
  }
  res.status(403).redirect('/');
};

export default {
  isNotEnded,
  isStarted,
};
