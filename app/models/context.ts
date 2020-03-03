import { NextPageContext } from 'next';
import { Request } from 'express';
import { User } from '.';

interface CRequest extends Request {
  user: User;
}

interface Context extends NextPageContext {
  req: CRequest;
}

export default Context;
