import { Post, Task, User } from 'moectf-core/models';
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
    isValidating,
    mutate,
  } = useSWR<Response<{ user: User }>>(routes.profileGet, fetcher, OPTIONS);

  return {
    user: data?.data?.user,
    error,
    isValidating,
    mutate: (user) => {
      mutate({ ...data, data: { user } });
    },
  };
};

// TODO: автоматическая ревалидация
export const getTasks = () => {
  const {
    data,
    error,
    isValidating,
    mutate
  } = useSWR<Response<{ tasks: Task[] }>>(routes.tasksGet, fetcher, OPTIONS);

  return {
    tasks: data?.data?.tasks,
    error,
    isValidating,
    mutate: (tasks) => {
      mutate({ ...data, data: { tasks } });
    },
  };
};

// TODO: автоматическая ревалидация
export const getPosts = () => {
  const {
    data,
    error,
    isValidating,
    mutate,
  } = useSWR<Response<{ posts: Post[] }>>(routes.postsGet, fetcher, OPTIONS);

  return {
    posts: data?.data?.posts,
    error,
    isValidating,
    mutate: (posts) => {
      mutate({ ...data, data: { posts } });
    },
  };
};

export const getTask = (tid?: string) => {
  const {
    data,
    error,
    isValidating,
    mutate,
  } = useSWR<Response<{ task: Task }>>(!tid ? null : routes.taskGet.replace(':_id', tid), fetcher, OPTIONS);

  return {
    task: data?.data?.task,
    error,
    isValidating,
    mutate: (task) => {
      mutate({ ...data, data: { task } });
    },
  };
};

export default routes;
