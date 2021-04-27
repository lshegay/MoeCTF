import { User } from '../models/units';
import response, { Response } from '../utils/response';
import { Controller } from '../models/database';

const isNotEnded = (_, config) => (req): Response => {
  const currentDate: Date = new Date(Date.now());

  if (!config.timer
    || (config.timer && config.endMatchDate && currentDate < new Date(config.endMatchDate))
    || (req.isAuthenticated() && (req.user as User).admin)) {
    return response.success({});
  }

  return response.fail({}, 'Game has already finished');
};

const isStarted = (_, config) => (req): Response => {
  const currentDate: Date = new Date(Date.now());

  if (!config.timer
    || (config.timer && config.startMatchDate && currentDate >= new Date(config.startMatchDate))
    || (req.isAuthenticated() && (req.user as User).admin)) {
    return response.success({});
  }
  return response.fail({}, 'Game has not started yet');
};

export default {
  is: {
    started: isStarted,
    not: {
      ended: isNotEnded,
    }
  },
};
