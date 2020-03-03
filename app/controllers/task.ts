import { RequestHandler } from 'express';
import { Database } from 'sqlite3';

import { User, Task, Category } from '../models';
import { DBTask, DBCategory } from '../models/db';

const getAll = (db: Database): RequestHandler => (req, res): void => {
  const { id } = req.user as User;

  db.all('SELECT t.task_id, t.task_name, t.task_content, '
    + 't.task_points, t.task_file, t.category_id, c.category_name, s.stask_id FROM task AS t '
    + 'JOIN category AS c ON c.category_id = t.category_id '
    + 'LEFT JOIN stask AS s ON s.task_id = t.task_id AND s.user_id = (?)',
  id, (_, tasks: DBTask[]) => {
    const compiledTasks: Task[] = [];
    tasks.forEach((task) => {
      const compiledTask: Task = {
        id: task.task_id,
        name: task.task_name,
        content: task.task_content,
        points: task.task_points,
        file: task.task_file,
        categoryId: task.category_id,
        categoryName: task.category_name,
        solved: !!task.stask_id,
      };

      compiledTasks.push(compiledTask);
    });

    db.all('SELECT * FROM category', (_, categories: DBCategory[]) => {
      const compiledCategories: Category[] = [];

      categories.forEach((category) => {
        const compiledCategory: Category = {
          id: category.category_id,
          name: category.category_name,
        };
        compiledCategories.push(compiledCategory);
      });

      res.status(200).json({ tasks: compiledTasks, categories: compiledCategories });
    });
  });
};

const getOne = (db: Database): RequestHandler => (req, res): void => {
  const { taskId } = req.params;
  const { id } = req.user as User;

  const statement = db.prepare('SELECT t.task_id, t.task_name, t.task_content, '
    + 't.task_points, t.task_file, t.category_id, c.category_name, s.stask_id FROM task AS t '
    + 'JOIN category AS c ON c.category_id = t.category_id '
    + 'LEFT JOIN stask AS s ON s.task_id = t.task_id AND s.user_id = (?) '
    + 'WHERE t.task_id = (?)');
  statement.get(id, taskId, (_, task: DBTask) => {
    const compiledTask: Task = {
      id: task.task_id,
      name: task.task_name,
      content: task.task_content,
      points: task.task_points,
      file: task.task_file,
      categoryId: task.category_id,
      categoryName: task.category_name,
      solved: !!task.stask_id,
    };

    db.all('SELECT * FROM category', (_, categories: DBCategory[]) => {
      const compiledCategories: Category[] = [];

      categories.forEach((category) => {
        const compiledCategory: Category = {
          id: category.category_id,
          name: category.category_name,
        };
        compiledCategories.push(compiledCategory);
      });

      res.status(200).json({ task: compiledTask, categories: compiledCategories });
    });
  });
};

export default {
  getAll,
  getOne,
};
