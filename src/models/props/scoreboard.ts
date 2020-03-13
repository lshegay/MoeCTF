import PageProps from './page';
import { User } from '../../../app/models/units';

interface ScoreboardProps extends PageProps {
  users: User[];
}

export default ScoreboardProps;
