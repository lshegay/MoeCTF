type UnitId = string;

type Unit = {
  _id: UnitId;
};

type Post = Unit & {
  name: string;
  date: number;
  // dateEdited: number,
  // authorId: string,
  content: string;
};

type Solved = Record<string, number>; // taskId, solvedDate

type Task = Unit & {
  name: string;
  content?: string;
  file?: string;
  flag?: string;
  points: number;
  tags?: string[];
  solved: Solved;
};

type User = Unit & {
  name: string;
  admin: boolean;
  avatar?: string;
  content?: string;
  email: string;
  password?: string;
};

type ScoreState = {
  date: number;
  points: number;
};

type SolvedTask = Unit & {
  name: string;
  tags: string[];
  date: number;
  points: number;
};

type ScoreboardUser = Unit & {
  name: string;
  points: number;
  tasks: Record<UnitId, SolvedTask>; // taskId, SolvedTask
  place: number;
};

type History = Record<UnitId, ScoreState[]>; // userId, HistoryUser
type Scoreboard = Record<UnitId, ScoreboardUser>; // userId, ScoreboardUser

type CacheData = Unit & {
  scoreboard: Scoreboard;
  history: History;
};

export type {
  UnitId,
  Solved,
  History,
  Scoreboard,
  Unit,
  Post,
  Task,
  User,
  CacheData,
  ScoreState,
  SolvedTask,
  ScoreboardUser,
};
