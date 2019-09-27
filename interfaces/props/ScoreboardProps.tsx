import PageProps from './PageProps';
import User from '../User';

interface ScoreboardProps extends PageProps {
  users: User[];
}

export default ScoreboardProps;
