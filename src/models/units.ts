export interface Unit {
  _id: string;
  name: string;
}

export interface Post extends Unit {
  date: number;
  content: string;
}

interface Solved {
  userId: number;
  date: number;
}

export interface Task extends Unit {
  categoryId: number;
  content?: string;
  file?: string;
  flag?: string;
  points: number;
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
