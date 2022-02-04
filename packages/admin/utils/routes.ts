import { Task, User } from 'moectf-core/models';
import { Response } from 'moectf-core/response';
import useSWR from 'swr';
import join from 'url-join';
import fetcher from './fetcher';
import config from '../config.json';

const routes = { ...config.routes };

Object.keys(routes).forEach((key) => {
  routes[key] = join(config.coreDomain, routes[key]);
});

export const getProfile = () => {
  const {
    data,
    error,
    isValidating
  } = useSWR<Response<{ user: User }>>(routes.profileGet, fetcher);

  return {
    user: data?.data?.user,
    error,
    isValidating,
  };
};

export const getTasks = () => {
  const {
    data,
    error,
    isValidating
  } = useSWR<Response<{ tasks: Task[] }>>(routes.tasksGet, fetcher);

  return {
    tasks: data?.data?.tasks,
    error,
    isValidating,
  };
};

export default routes;
