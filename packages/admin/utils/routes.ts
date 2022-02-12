import { Post, Task, User, RouteNames } from 'moectf-core/models';
import { Response, ResponseError, Status } from 'moectf-core/response';
import useSWR, { SWRConfiguration } from 'swr';
import mapValues from 'lodash/mapValues';
import join from 'url-join';
import fetcher from './fetcher';
import config from '../config.json';

const routes: RouteNames = mapValues(config.routes, (v) => join(config.coreDomain, v));

const options: SWRConfiguration = {
  revalidateOnFocus: false,
};

export const useProfile = () => {
  const {
    data,
    isValidating,
    error,
    mutate,
  } = useSWR<Response<{ user: User }>, ResponseError>(routes.profileGet, fetcher, options);

  const response = {
    isValidating,
    user: data?.status == Status.SUCCESS ? data.data.user : undefined,
    fail: data?.status == Status.FAIL ? data.data : undefined,
    error,
    mutate: async (user: User) => {
      if (data?.status == Status.SUCCESS) {
        await mutate({ ...data, data: { user } });
      }
    },
  };

  return response;
};

// TODO: автоматическая ревалидация
export const useTasks = () => {
  const {
    data,
    isValidating,
    error,
    mutate,
  } = useSWR<Response<{ tasks: Task[] }>, ResponseError>(routes.tasksGet, fetcher, options);

  return {
    tasks: data?.status == Status.SUCCESS ? data.data.tasks : undefined,
    fail: data?.status == Status.FAIL ? data.data : undefined,
    isValidating,
    error,
    mutate: async (tasks: Task[]) => {
      if (data?.status == Status.SUCCESS) {
        await mutate({ ...data, data: { tasks } });
      }
    },
  };
};

export const useTask = (tid?: string) => {
  const {
    data,
    isValidating,
    error,
    mutate,
  } = useSWR<Response<{ task: Task }>, ResponseError>(tid ? routes.taskGet.replace(':_id', tid) : null, fetcher, options);

  return {
    task: data?.status == Status.SUCCESS ? data.data.task : undefined,
    fail: data?.status == Status.FAIL ? data.data : undefined,
    isValidating,
    error,
    mutate: async (task: Task) => {
      if (data?.status == Status.SUCCESS) {
        await mutate({ ...data, data: { task } });
      }
    },
  };
};

// TODO: автоматическая ревалидация
export const usePosts = () => {
  const {
    data,
    isValidating,
    error,
    mutate,
  } = useSWR<Response<{ posts: Post[] }>, ResponseError>(routes.postsGet, fetcher, options);

  return {
    posts: data?.status == Status.SUCCESS ? data.data.posts : undefined,
    fail: data?.status == Status.FAIL ? data.data : undefined,
    isValidating,
    error,
    mutate: async (posts: Post[]) => {
      if (data?.status == Status.SUCCESS) {
        await mutate({ ...data, data: { posts } });
      }
    },
  };
};

// TODO: автоматическая ревалидация
export const useUsers = () => {
  const {
    data,
    isValidating,
    error,
    mutate,
  } = useSWR<Response<{ users: User[] }>, ResponseError>(routes.adminUsersGet, fetcher, options);

  return {
    users: data?.status == Status.SUCCESS ? data.data.users : undefined,
    fail: data?.status == Status.FAIL ? data.data : undefined,
    isValidating,
    error,
    mutate: async (users: User[]) => {
      if (data?.status == Status.SUCCESS) {
        await mutate({ ...data, data: { users } });
      }
    },
  };
};

export default routes;
