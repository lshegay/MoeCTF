import { Task, User } from 'moectf-core/models';
import { Response } from 'moectf-core/response';
import useSWR, { SWRConfiguration } from 'swr';
import join from 'url-join';
import fetcher from './fetcher';
import config from '../config.json';

const routes = { ...config.routes };

Object.keys(routes).forEach((key) => {
  routes[key] = join(config.coreDomain, routes[key]);
});

const OPTIONS: SWRConfiguration = {
  revalidateOnFocus: false,
};

export const getProfile = () => {
  const {
    data,
    error,
    isValidating
  } = useSWR<Response<{ user: User }>>(routes.profileGet, fetcher, OPTIONS);

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
  } = useSWR<Response<{ tasks: Task[] }>>(routes.tasksGet, fetcher, OPTIONS);

  return {
    tasks: data?.data?.tasks,
    error,
    isValidating,
  };
};

export const getTask = (tid?: string) => {
  const {
    data,
    error,
    isValidating
  } = useSWR<Response<{ task: Task }>>(!tid ? null : routes.taskGet.replace(':_id', tid), fetcher, OPTIONS);

  return {
    task: data?.data?.task,
    error,
    isValidating,
  };
};

export default routes;
