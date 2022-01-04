import { User } from '../models/units';

const isAuthenticated = ({ req }): boolean => req.isAuthenticated();

const isAdmin = ({ req }): boolean => (
  isAuthenticated({ req }) && (req.user as User).admin
);

export {
  isAuthenticated,
  isAdmin,
};
