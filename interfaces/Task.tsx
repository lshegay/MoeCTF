import Post from './Post';

interface Task extends Post {
  name: string;
  points: number;
  file?: string;
  categoryId: number;
  categoryName?: string;
  solved?: boolean;
}

export default Task;
