import PageProps from './page';
import User from '../user';

interface ScoreboardProps extends PageProps {
  users: User[];
}

export default ScoreboardProps;
