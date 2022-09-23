import { RequestHandler } from 'express';
import { Config } from 'src/models';
import response from '../utils/response';
import { Database } from '../models/database';
import { matchFuncs } from '../funcs';

const release = (db: Database, config: Config) => {
  const match = matchFuncs(db, config);

  const isNotEnded: RequestHandler = (req, res, next): void => {
    if (match.isNotEnded(req.user)) {
      return next();
    }
  
    res.status(403).json(response.fail({ message: 'Game has already finished' }));
  };
  
  const isStarted: RequestHandler = (req, res, next): void => {
    if (match.isStarted(req.user)) {
      return next();
    }
    res.status(403).json(response.fail({ message: 'Game has not started yet' }));
  };
  
  return {
    is: {
      started: isStarted,
      not: {
        ended: isNotEnded,
      },
    },
  };
};

export default release;
