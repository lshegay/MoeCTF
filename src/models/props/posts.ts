import PageProps from './page';
import Post from '../post';

interface PostsProps extends PageProps {
  posts: Post[];
}

export default PostsProps;
