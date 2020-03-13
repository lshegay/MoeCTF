import PageProps from './page';
import { Post } from '../../../app/models/units';

interface PostsProps extends PageProps {
  posts: Post[];
  currentDate: number;
}

export default PostsProps;
