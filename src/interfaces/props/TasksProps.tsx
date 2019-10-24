import PageProps from './PageProps';
import Task from '../Task';
import Category from '../Category';

interface TasksProps extends PageProps {
  tasks: Task[];
  categories: Category[];
  isGameEnded: boolean;
}

export default TasksProps;
