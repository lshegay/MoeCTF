export interface Post {
  id: number;
  title?: string;
  content?: string;
  date?: number;
}

export interface Task extends Post {
  name: string;
  points: number;
  flag?: string;
  categoryId: number;
  categoryName?: string;
  file?: string;
  solved?: boolean;
}

export interface STask extends Post {
  userId: number;
  userName: string;
  taskId: number;
  points: number;
}

export interface User {
  id: number;
  name: string;
  content?: string;
  email?: string;
  admin?: boolean;
  avatar?: string;
  points?: number;
}

export interface Category {
  id: number;
  name: string;
}
