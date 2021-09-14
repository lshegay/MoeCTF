import { User } from '../models/units';
import response, { Response } from '../utils/response';

const isAuthenticated = (req): Response => {
  if (req.isAuthenticated()) {
    return response.success({});
  }
  return response.fail({}, 'User should be authenticated');
};

const isNotAuthenticated = (req): Response => {
  if (!req.isAuthenticated()) {
    return response.success({});
  }
  return response.fail({}, 'User is authenticated already');
};

const isAdmin = (req): Response => {
  if ((req.user as User).admin) {
    return response.success({});
  }
  return response.fail({}, 'User does not have enough privileges to do this');
};

export default {
  is: {
    authenticated: isAuthenticated,
    admin: isAdmin,
    not: {
      authenticated: isNotAuthenticated,
    }
  },
};
