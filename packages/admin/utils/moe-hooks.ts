import { Post, Task, User } from 'moectf-core/models';
import { Response, ResponseError, Status } from 'moectf-core/response';
import useSWR, { SWRConfiguration } from 'swr';
import fetcher from './fetcher';
import { routes } from './moe-fetch';

const OPTIONS: SWRConfiguration = {
  revalidateOnFocus: false,
};

export type ErrorUndefined = ResponseError<undefined>;

export type ProfileData = { user: User };
export const useProfile = () => {
  const {
    data,
    isValidating,
    error,
    mutate,
  } = useSWR<Response<ProfileData>, ErrorUndefined>(routes.profileGet, fetcher, OPTIONS);

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
export type TasksData = { tasks: Task[] };
export const useTasks = () => {
  const {
    data,
    isValidating,
    error,
    mutate,
  } = useSWR<Response<TasksData>, ErrorUndefined>(routes.tasksGet, fetcher, OPTIONS);

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

export type TaskData = { task: Task };
export const useTask = (tid?: string) => {
  const {
    data,
    isValidating,
    error,
    mutate,
  } = useSWR<Response<TaskData>, ErrorUndefined>(tid ? routes.taskGet.replace(':_id', tid) : null, fetcher, OPTIONS);

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
export type PostsData = { posts: Post[] };
export const usePosts = () => {
  const {
    data,
    isValidating,
    error,
    mutate,
  } = useSWR<Response<PostsData>, ErrorUndefined>(routes.postsGet, fetcher, OPTIONS);

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
export type UsersData = { users: User[] };
export const useUsers = () => {
  const {
    data,
    isValidating,
    error,
    mutate,
  } = useSWR<Response<UsersData>, ErrorUndefined>(routes.adminUsersGet, fetcher, OPTIONS);

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
