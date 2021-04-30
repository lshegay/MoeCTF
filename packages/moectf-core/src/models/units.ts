export interface Unit {
  _id: string;
  name: string;
}

export interface Post extends Unit {
  date: number;
  content: string;
}

interface Solved {
  userId: string;
  date: number;
}

export interface Task extends Unit {
  categoryId: string;
  content?: string;
  file?: string;
  flag?: string;
  points: number;
  // TODO: turn from array into map
  solved: Solved[];
}

export interface User extends Unit {
  admin: boolean;
  avatar?: string;
  content?: string;
  email: string;
  password?: string;
}

export type Category = Unit;
