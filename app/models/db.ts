
interface DBUser {
  user_id: number;
  user_name: string;
  user_password: string;
  user_content?: string;
  user_email?: string;
  user_admin?: boolean;
  user_avatar?: string;
  'SUM(t.task_points)'?: number;
}

interface DBPost {
  post_id: number;
  post_title?: string;
  post_content?: string;
  post_date?: number;
}

interface DBTask {
  task_id: number;
  task_name: string;
  task_content: string;
  task_points: number;
  category_id: number;
  category_name?: string;
  task_file?: string;
  stask_id?: number;
}

interface DBSTask {
  stask_id: number;
  user_id: number;
  task_id: number;
  stask_date: number;
}

interface DBCategory {
  category_id: number;
  category_name: string;
}

export {
  DBUser,
  DBTask,
  DBSTask,
  DBCategory,
  DBPost,
};
