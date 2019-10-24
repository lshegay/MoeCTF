import Post from './Post';

interface STask extends Post {
  userId: number;
  userName: string;
  taskId: number;
  points: number;
  date: number;
}

export default STask;
