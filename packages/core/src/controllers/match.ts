import response from '../utils/response';
import { Controller } from '../models/database';
import match from '../funcs/match';

const isNotEnded: Controller = (_, config) => (req, res, next): void => {
  if (match.isNotEnded({ config, req })) {
    return next();
  }

  res.status(403).json(response.fail({ message: 'Game has already finished' }));
};

const isStarted: Controller = (_, config) => (req, res, next): void => {
  if (match.isStarted({ config, req })) {
    return next();
  }
  res.status(403).json(response.fail({ message: 'Game has not started yet' }));
};

export default {
  is: {
    started: isStarted,
    not: {
      ended: isNotEnded,
    }
  },
};
