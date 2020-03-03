import { RequestHandler } from 'express';
import { UploadedFile } from 'express-fileupload';
import { Database } from 'sqlite3';

import config from '../settings/config';

const createCategory = (db: Database): RequestHandler => (req, res): void => {
  const { name } = req.body;

  db.run('INSERT INTO category (category_name) VALUES (?)', name, (error: Error) => {
    if (error) throw error;

    res.redirect('/tasks');
  });
};

const deleteCategory = (db: Database): RequestHandler => (req, res): void => {
  const { id } = req.body;

  db.serialize(() => {
    db.run('DELETE FROM stask WHERE stask_id IN '
      + '(SELECT s.stask_id FROM stask AS s JOIN task AS t ON t.task_id = s.task_id '
      + 'WHERE t.category_id=(?))', id);
    db.run('DELETE FROM task WHERE category_id=(?)', id);
    db.run('DELETE FROM category WHERE category_id=(?)', id, (error: Error) => {
      if (error) throw error;

      res.redirect('/tasks');
    });
  });
};

const createPost = (db: Database): RequestHandler => (req, res): void => {
  const { title, content } = req.body;

  db.run('INSERT INTO post (post_title, post_content, post_date) VALUES (?, ?, ?)',
    title, content, Date.now(), (error: Error) => {
      if (error) throw error;

      res.redirect('/');
    });
};

const deletePost = (db: Database): RequestHandler => (req, res): void => {
  const { id } = req.body;

  db.serialize(() => {
    db.run('DELETE FROM post WHERE post_id=(?)', id, (error: Error) => {
      if (error) throw error;

      res.redirect('/');
    });
  });
};

const createTask = (db: Database): RequestHandler => (req, res): void => {
  const {
    name,
    category,
    content,
    points,
    flag,
  } = req.body;

  if (Number.isNaN(parseInt(points, 10)) || Number.isNaN(parseInt(category, 10))) {
    req.flash('error', 'Points should be number');
    return res.redirect('/tasks');
  }

  const statement = db.prepare('INSERT INTO task (task_name, category_id, '
    + 'task_content, task_points, task_file, task_flag) VALUES (?, ?, ?, ?, ?, ?)',
  (error): void => {
    if (error) throw error;

    return res.status(200).redirect('/tasks');
  });

  if (req.files?.file) {
    const file = req.files.file as UploadedFile;

    file.mv(`./${config.staticDir}/${file.name.split(' ').join('_')}`, (error: Error) => {
      if (error) throw error;

      statement.run(name, category, content, points, file.name.split(' ').join('_'), flag.trim().replace('\n', ''));
    });
  } else {
    statement.run(name, category, content, points, null, flag.trim().replace('\n', ''));
  }
};

const updateTask = (db: Database): RequestHandler => (req, res): void => {
  const {
    id,
    name,
    category,
    content,
    points,
    flag,
  } = req.body;

  if (Number.isNaN(parseInt(points, 10)) || Number.isNaN(parseInt(category, 10))) {
    req.flash('error', 'Points should be number');
    return res.redirect('/tasks');
  }

  const vars = [name, category, content, points];
  if (req.files?.file) vars.push((req.files.file as UploadedFile).name.replace(' ', '_'));
  if (flag) vars.push(flag.trim().replace('\n', ''));
  vars.push(id);

  const statement = db.prepare('UPDATE task SET task_name = (?), category_id = (?), '
    + 'task_content = (?), task_points = (?) '
    + `${req.files?.file ? ', task_file = (?) ' : ''}`
    + `${flag ? ', task_flag = (?) ' : ''}`
    + 'WHERE task_id = (?)',
  (error: Error): void => {
    if (error) throw error;

    return res.status(200).redirect(`/tasks/${id}`);
  });

  if (req.files?.file) {
    const file = req.files.file as UploadedFile;

    file.mv(`./${config.staticDir}/${file.name.split(' ').join('_')}`, (error: Error) => {
      if (error) {
        return res.status(500).send(error);
      }

      statement.run(vars);
    });
  } else {
    statement.run(vars);
  }
};

const deleteTask = (db: Database): RequestHandler => (req, res): void => {
  const { id } = req.body;

  db.serialize(() => {
    db.run('DELETE FROM stask WHERE task_id=(?)', id);
    db.run('DELETE FROM task WHERE task_id=(?)', id, (error: Error) => {
      if (error) throw error;

      res.redirect('/tasks');
    });
  });
};

export default {
  createCategory,
  deleteCategory,
  createPost,
  deletePost,
  createTask,
  updateTask,
  deleteTask,
};
