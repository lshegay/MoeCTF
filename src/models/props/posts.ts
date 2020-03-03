import PageProps from './page';
import { Post } from '../../../app/models';

interface PostsProps extends PageProps {
  posts: Post[];
  currentDate: number;
}

export default PostsProps;
