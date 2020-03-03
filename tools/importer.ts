import path from 'path';
import sqlite3 from 'sqlite3';
import fs from 'fs';

import { Post, Task, Category } from '../app/models/index';
import { DBTask, DBCategory, DBPost } from '../app/models/db';

import config from '../app/settings/config';
import { toTask, toCategory, toPost } from '../app/utils/convert';

const databasePath = path.resolve('./', config.database);

const sq = sqlite3.verbose();
const db = new sq.Database(databasePath);

type JSONParams = {
  posts: Post[];
  tasks: Task[];
  categories: Category[];
};

const importer = ({ posts, categories, tasks }: JSONParams): void => {
  db.serialize(() => {
    if (categories && categories.length > 0) {
      const sqlcats = categories.map((category, index) => {
        const { id, name } = category;
        if (index == 0) return `SELECT ${id} as category_id, "${name}" as category_name`;
        return `UNION ALL SELECT ${id}, "${name}"`;
      }).join(' ');

      db.run(`INSERT OR IGNORE INTO category (category_id, category_name) ${sqlcats}`);
    }

    if (tasks && tasks.length > 0) {
      const sqltasks: string[] = [];
      const values: any = [];

      tasks.forEach((task, index) => {
        const { id, name, categoryId, points, file, flag, content } = task;

        if (index == 0) {
          sqltasks.push('SELECT (?) as task_id, (?) as task_name, '
          + '(?) as task_flag, (?) as task_points, '
          + '(?) as task_content, (?) as task_file, '
          + '(?) as category_id');
        } else {
          sqltasks.push('UNION ALL SELECT (?), (?), (?), (?), (?), (?), (?)');
        }

        values.push(id, name, flag, points, content, file, categoryId);
      });

      db.run('INSERT OR IGNORE INTO task (task_id, task_name, task_content, '
      + `task_flag, task_points, task_file, category_id) ${sqltasks.join(' ')}`, values);
    }

    if (posts && posts.length > 0) {
      const sqlposts = posts.map((post, index) => {
        const {
          id,
          title,
          content,
          date,
        } = post;
        if (index == 0) {
          return `SELECT ${id} as post_id, "${title}" as post_title, "${content}" as post_content, `
          + `${date} as post_date`;
        }
        return `UNION ALL SELECT ${id}, "${title}", "${content}", ${date}`;
      }).join(' ');

      db.run(`INSERT OR IGNORE INTO post (post_id, post_title, post_content, post_date) ${sqlposts}`);
    }
  });
};

const exporter = async (): Promise<JSONParams> => {
  const json: JSONParams = { tasks: [], posts: [], categories: [] };

  json.tasks = await new Promise<Task[]>((resolve) => db.all('SELECT * FROM task', (_, rows: DBTask[]) => {
    resolve(rows.map((task) => toTask(task)));
  }));

  json.categories = await new Promise<Category[]>((resolve) => db.all('SELECT * FROM category', (_, rows: DBCategory[]) => {
    resolve(rows.map((category) => toCategory(category)));
  }));

  json.posts = await new Promise<Post[]>((resolve) => db.all('SELECT * FROM post', (_, rows: DBPost[]) => {
    resolve(rows.map((post) => toPost(post)));
  }));

  return json;
};

const mode = process.argv[2];
const fileName = process.argv[3] ?? path.resolve('./tasks.json');

switch (mode) {
  case '--import': {
    if (!fs.existsSync(fileName)) {
      console.log('File name is not found');
      process.exit();
    }

    const content = fs.readFileSync(fileName);
    const params: JSONParams = JSON.parse(content.toLocaleString());
    importer(params);

    console.log('Import has been successful');
    break;
  }
  case '--export': {
    exporter().then((json) => {
      fs.writeFileSync(fileName, JSON.stringify(json));
    });
    break;
  }
  default: {
    console.log('Chosen mode is not correct');
    break;
  }
}
