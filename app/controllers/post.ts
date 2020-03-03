import { RequestHandler } from 'express';
import { Database } from 'sqlite3';

import { Post } from '../models';
import { DBPost } from '../models/db';

const getAll = (db: Database): RequestHandler => (_, res): void => {
  db.all('SELECT * FROM post ORDER BY post_date DESC', (_, posts: DBPost[]) => {
    const newPosts: Post[] = posts.map((post) => {
      const readyPost: Post = {
        id: post.post_id,
        title: post.post_title,
        content: post.post_content,
        date: post.post_date,
      };

      return readyPost;
    });

    res.status(200).json({ posts: newPosts });
  });
};

export default {
  getAll,
};
