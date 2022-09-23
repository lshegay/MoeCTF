import { Post, Task, User, RouteNames } from 'moectf-core/models';
import { Response, ResponseError, Status } from 'moectf-core/response';
import request from 'moectf-core/request';
import mapValues from 'lodash/mapValues';
import join from 'url-join';
import fetcher from './fetcher';
import config from '../config.json';

export const routes: RouteNames = mapValues(config.routes, (v) => join(config.coreDomain, v));

export type LoginValues = { name: string; password: string };
export const login = async (values: LoginValues) => {
  const response = await fetcher<{ user: User }, LoginValues>(routes.login, {
    method: 'POST',
    body: JSON.stringify(values),
  });

  return response;
};

export const logout = async () => {
  const response = await fetcher<null>(routes.logout);

  return response.status == Status.SUCCESS;
};

export type CreatePostValues = { name: string; content: string };
export const createPost = async (values: CreatePostValues) => {
  const response = await fetcher<{ post: Post }, CreatePostValues>(routes.postsPost, {
    method: 'POST',
    body: JSON.stringify(values),
  });

  return response;
};

export type UpdatePostValues = { name?: string; content?: string };
export const updatePost = async (postId: string, values: UpdatePostValues) => {
  const response = await fetcher<{ post: Post }, UpdatePostValues>(routes.postPut.replace(':_id', postId), {
    method: 'PUT',
    body: JSON.stringify(values),
  });

  return response;
};

export const deletePost = async (postId: string) => {
  const response = await fetcher<{ numRemoved: number }, { _id }>(routes.postDelete.replace(':_id', postId), {
    method: 'DELETE',
  });

  return response;
};

export type CreateTaskValues = {
  name: string;
  content?: string;
  flag: string;
  tags: string[];
  points: number;
  file?: File;
};
export const createTask = async (values: CreateTaskValues) => {
  const formData = request.convert(values);

  const response = await fetcher<{ task: Task }, CreateTaskValues>(routes.tasksPost, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  return response;
};

export type UpdateTaskValues = {
  name?: string;
  content?: string;
  flag?: string;
  tags?: string[];
  points?: number;
  file?: File;
};
export const updateTask = async (taskId: string, values: UpdateTaskValues) => {
  const formData = request.convert(values);

  const response = await fetcher<{ task: Task }, UpdateTaskValues>(routes.taskPut.replace(':_id', taskId), {
    method: 'PUT',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  return response;
};

export const deleteTask = async (taskId: string) => {
  const response = await fetcher<{ numRemoved: number }, { _id }>(routes.taskDelete.replace(':_id', taskId), {
    method: 'DELETE',
  });

  return response;
};

export const deleteUser = async (userId: string) => {
  const response = await fetcher<{ numRemoved: number }, { _id }>(routes.userDelete.replace(':_id', userId), {
    method: 'DELETE',
  });

  return response;
};
