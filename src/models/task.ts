import Post from './post';

interface Task extends Post {
  name: string;
  points: number;
  categoryId: number;
  categoryName?: string;
  file?: string;
  solved?: boolean;
}

export default Task;
