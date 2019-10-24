import PageProps from './PageProps';
import Post from '../Post';

interface PostsProps extends PageProps {
  posts: Post[];
}

export default PostsProps;
