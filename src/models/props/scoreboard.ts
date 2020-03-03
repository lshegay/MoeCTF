import PageProps from './page';
import { User } from '../../../app/models';

interface ScoreboardProps extends PageProps {
  users: User[];
}

export default ScoreboardProps;
