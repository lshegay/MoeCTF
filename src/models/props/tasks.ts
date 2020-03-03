import PageProps from './page';
import { Task, Category } from '../../../app/models';

interface TasksProps extends PageProps {
  tasks: Task[];
  categories: Category[];
  isGameEnded: boolean;
}

export default TasksProps;
