import {
  User,
  Task,
  Category,
  Post,
} from '../models';
import {
  DBUser,
  DBTask,
  DBCategory,
  DBPost,
} from '../models/db';

const toUser = (user: DBUser): User => ({
  id: user.user_id,
  name: user.user_name,
  content: user.user_content,
  admin: user.user_admin,
  email: user.user_email,
  avatar: user.user_avatar,
  points: user['SUM(t.task_points)'] ?? 0,
});

const toPost = (post: DBPost): Post => ({
  id: post.post_id,
  title: post.post_title,
  content: post.post_content,
  date: post.post_date,
});

const toTask = (task: DBTask): Task => ({
  id: task.task_id,
  name: task.task_name,
  content: task.task_content,
  points: task.task_points,
  file: task.task_file ?? '',
  categoryId: task.category_id,
  categoryName: task.category_name,
  solved: !!task.stask_id,
});

const toCategory = (category: DBCategory): Category => ({
  id: category.category_id,
  name: category.category_name,
});

export {
  toUser,
  toCategory,
  toPost,
  toTask,
};
