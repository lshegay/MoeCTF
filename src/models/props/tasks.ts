import PageProps from './page';
import Task from '../../../app/models/task';
import Category from '../../../app/models/category';

interface TasksProps extends PageProps {
  tasks: Task[];
  categories: Category[];
  isGameEnded: boolean;
}

export default TasksProps;
