export interface Unit {
  _id: string;
  name: string;
}

export interface Post extends Unit {
  date: number;
  // dateEdited: number;
  // authorId: string;
  content: string;
}

type Solved = Record<string, number>; // taskId, solvedDate

export interface Task extends Unit {
  content?: string;
  file?: string;
  flag?: string;
  points: number;
  tags?: string[];
  solved: Solved;
}

export interface User extends Unit {
  admin: boolean;
  avatar?: string;
  content?: string;
  email: string;
  password?: string;
}

type History = Record<string, ScoreState>; // userId, HistoryUser
type Scoreboard = Record<string, ScoreboardUser> // userId, ScoreboardUser

export interface CacheData {
  _id: string;
  scoreboard: Scoreboard;
  history: History;
}

export interface ScoreState {
  date: number;
  points: number;
}

export interface SolvedTask extends Unit {
  tags: string[];
  date: number;
  points: number;
}

export interface ScoreboardUser {
  name: string;
  points: number;
  tasks: Partial<SolvedTask>[];
  dateSum: number;
}

export type {
  Solved,
  History,
  Scoreboard,
};
