import { User } from '../models/units';

const isNotEnded = ({ config, req }): boolean => {
  const currentDate: Date = new Date(Date.now());

  return (!config.timer
    || (config.timer && config.endMatchDate && currentDate < new Date(config.endMatchDate))
    || (req.isAuthenticated() && (req.user as User).admin));
};

const isStarted = ({ config, req }): boolean => {
  const currentDate: Date = new Date(Date.now());

  return (!config.timer
    || (config.timer && config.startMatchDate && currentDate >= new Date(config.startMatchDate))
    || (req.isAuthenticated() && (req.user as User).admin));
};

export default {
  isStarted,
  isNotEnded,
};
