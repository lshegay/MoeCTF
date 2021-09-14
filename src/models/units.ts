export interface Unit {
  _id: string;
  name: string;
}

export interface Post extends Unit {
  date: number;
  content: string;
}

type Solved = Record<string, number>;

export interface Task extends Unit {
  categoryId: string;
  content?: string;
  file?: string;
  flag?: string;
  points: number;
  // TODO: turn from array into map
  solved: Solved;
}

export interface User extends Unit {
  admin: boolean;
  avatar?: string;
  content?: string;
  email: string;
  password?: string;
}

export interface CacheData extends Unit {
  scoreboard: ScoreboardUser[];
}

export interface ScoreboardUser {
  name: string;
  points: number;
  tasks: Partial<Task>[];
  dateSum: number;
}

export type Category = Unit;
