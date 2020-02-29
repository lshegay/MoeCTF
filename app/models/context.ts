import { NextPageContext } from 'next';
import { Request } from 'express';
import User from './user';

interface CRequest extends Request {
  user: User;
}

interface Context extends NextPageContext {
  req: CRequest;
}

export default Context;
