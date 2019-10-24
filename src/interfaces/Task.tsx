import Post from './Post';

interface Task extends Post {
  name: string;
  points: number;
  categoryId: number;
  categoryName?: string;
  file?: string;
  solved?: boolean;
}

export default Task;
