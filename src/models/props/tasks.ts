import PageProps from './page';
import Task from '../task';
import Category from '../category';

interface TasksProps extends PageProps {
  tasks: Task[];
  categories: Category[];
  isGameEnded: boolean;
}

export default TasksProps;
