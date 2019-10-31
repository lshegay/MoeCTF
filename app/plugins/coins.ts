import urljoin from 'url-join';
import moment from 'moment';

import User from '../../src/models/user';
import Plugin from '../../src/models/plugin';
import Task from '../../src/models/task';
import Category from '../../src/models/category';

import { isNotMatchEnded, isMatchStarted } from '../controllers/match';
import { isAuthenticated, isNotAuthenticated, isAdmin } from '../controllers/user';

export interface CoinsOptions extends Plugin {
  userCash?: number;
  routes?: {
    api: string;
    admin: {
      hint: string;
      create: string;
      update: string;
      delete: string;
    };
    coins: {
      hint: string;
      hints: string;
      pay: string;
      wallet: string;
    };
  };
}

export interface Hint {
  id: number;
  price: number;
  content?: string;
}

export interface CoinsUser extends User {
  wallet: number;
}

export interface CoinsTask extends Task {
  hint?: Hint;
  profit?: number;
}


const coins = (options: CoinsOptions): void => {
  const def = {
    userCash: 100,
    routes: {
      api: 'api',
      admin: {
        hint: 'admin/hint',
        create: 'admin/create/hint',
        update: 'admin/update/hint',
        delete: 'admin/delete/hint',
      },
      coins: {
        pay: 'pay',
        wallet: 'wallet',
      },
    },
  };

  const {
    db,
    server,
    routes,
    userCash,
  } = { ...def, ...options };

  if (!routes) {
    throw Error('routes is undefined');
  }

  db.parallelize(() => {
    db.run('CREATE TABLE IF NOT EXISTS hint ('
    + 'hint_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,'
    + 'hint_price INTEGER NOT NULL,'
    + 'hint_content TEXT NOT NULL,'
    + 'task_id INTEGER NOT NULL,'
    + 'task_profit INTEGER NOT NULL)');

    db.run('CREATE TABLE IF NOT EXISTS uhint ('
    + 'uhint_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,'
    + 'uhint_date INTEGER NOT NULL,'
    + 'hint_id INTEGER NOT NULL,'
    + 'user_id INTEGER NOT NULL)');
  });

  server.use((req, _, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }

    const currentUser = req.user as CoinsUser;
    db.get('SELECT SUM(h.task_profit), SUM(ht.hint_price) '
      + 'FROM user AS u LEFT JOIN stask AS s ON s.user_id = u.user_id '
      + 'LEFT JOIN task AS t ON s.task_id = t.task_id '
      + 'LEFT JOIN hint AS h ON h.task_id = s.task_id '
      + 'LEFT JOIN uhint AS uh ON uh.hint_id = h.hint_id AND uh.user_id = u.user_id '
      + 'LEFT JOIN hint AS ht ON ht.hint_id = uh.hint_id AND uh.user_id = u.user_id '
      + 'WHERE u.user_id = (?) '
      + 'GROUP BY u.user_id',
    currentUser.id, (error, nums) => {
      if (error || !nums) {
        console.error(error || 'User was not found or something bad happened :c');
      }

      const money = userCash + (nums['SUM(h.task_profit)'] || 0);
      const expenses = nums['SUM(ht.hint_price)'] || 0;
      currentUser.wallet = money - expenses;

      next();
    });
  });

  server.post(urljoin('/', routes.api, 'users'), (_, res) => {
    db.all('SELECT u.user_id, u.user_name, SUM(t.task_points), '
      + 'SUM(h.task_profit), SUM(ht.hint_price) '
      + 'FROM user AS u LEFT JOIN stask AS s ON s.user_id = u.user_id '
      + 'LEFT JOIN task AS t ON s.task_id = t.task_id '
      + 'LEFT JOIN hint AS h ON h.task_id = s.task_id '
      + 'LEFT JOIN uhint AS uh ON uh.hint_id = h.hint_id AND uh.user_id = u.user_id '
      + 'LEFT JOIN hint AS ht ON ht.hint_id = uh.hint_id AND uh.user_id = u.user_id '
      + 'WHERE u.user_admin = 0 '
      + 'GROUP BY u.user_id ORDER BY SUM(t.task_points) DESC, s.stask_date ASC',
    (error, users) => {
      if (error || !users) {
        console.error(error || 'No users were found lol c:');
        return res.status(200).json({
          status: error || 'No users were found lol c:',
        });
      }

      const newUsers: CoinsUser[] = users.map((user) => {
        const money = userCash + (user['SUM(h.task_profit)'] || 0);
        const expenses = user['SUM(ht.hint_price)'] || 0;

        const readyUser: CoinsUser = {
          id: user.user_id,
          name: user.user_name,
          points: user['SUM(t.task_points)'] || 0,
          wallet: money - expenses,
        };

        return readyUser;
      });

      res.status(200).json({ users: newUsers });
    });
  });

  server.post(urljoin('/', routes.api, 'tasks'), isAuthenticated, isMatchStarted, (req, res) => {
    const { id, admin } = req.user as CoinsUser;

    db.all('SELECT *, t.task_id, h.hint_id FROM task AS t '
      + 'JOIN category AS c ON c.category_id = t.category_id '
      + 'LEFT JOIN stask AS s ON s.task_id = t.task_id AND s.user_id = (?) '
      + 'LEFT JOIN hint as h ON h.task_id = t.task_id '
      + 'LEFT JOIN uhint as uh ON h.hint_id = uh.hint_id',
    id, (error, tasks) => {
      if (error || !tasks) {
        console.error(error || 'No tasks were found lol :c');
        return res.status(200).json({
          status: error || 'No tasks were found lol :c',
        });
      }

      const compiledTasks: CoinsTask[] = [];
      tasks.forEach((task) => {
        const compiledTask: CoinsTask = {
          id: task.task_id,
          name: task.task_name,
          content: task.task_content,
          points: task.task_points,
          file: task.task_file,
          categoryId: task.category_id,
          categoryName: task.category_name,
          solved: !!task.stask_id,
          ...(!!task.hint_id && {
            profit: task.task_profit,
            hint: {
              id: task.hint_id,
              price: task.hint_price,
              ...((!!task.uhint_id || admin) && {
                content: task.hint_content,
              }),
            }
          })
        };

        compiledTasks.push(compiledTask);
      });

      db.all('SELECT * FROM category', (_, categories) => {
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
  });

  server.post(urljoin('/', routes.api, 'tasks', ':taskId'), isAuthenticated, isMatchStarted, (req, res) => {
    const { taskId } = req.params;
    const { id, admin } = req.user as CoinsUser;

    const statement = db.prepare('SELECT *, t.task_id, h.hint_id FROM task AS t '
      + 'JOIN category AS c ON c.category_id = t.category_id '
      + 'LEFT JOIN stask AS s ON s.task_id = t.task_id AND s.user_id = (?) '
      + 'LEFT JOIN hint as h ON h.task_id = t.task_id '
      + 'LEFT JOIN uhint as uh ON h.hint_id = uh.hint_id '
      + 'WHERE t.task_id = (?)');
    statement.get(id, taskId, (error, task) => {
      if (error || !task) {
        console.error(error || 'No task was found lol :c');
        return res.status(200).json({
          status: error || 'No task was found lol :c',
        });
      }

      const compiledTask: CoinsTask = {
        id: task.task_id,
        name: task.task_name,
        content: task.task_content,
        points: task.task_points,
        file: task.task_file,
        categoryId: task.category_id,
        categoryName: task.category_name,
        solved: !!task.stask_id,
        ...(!!task.hint_id && {
          profit: task.task_profit,
          hint: {
            id: task.hint_id,
            price: task.hint_price,
            ...((!!task.uhint_id || admin) && {
              content: task.hint_content,
            }),
          }
        })
      };

      db.all('SELECT * FROM category', (_, categories) => {
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
  });

  server.post(urljoin('/', routes.api, routes.admin.create), isAdmin, (req, res) => {
    const {
      price,
      content,
      taskId,
      taskProfit,
    } = req.body;

    if (Number.isNaN(parseInt(taskId, 10))
      || Number.isNaN(parseInt(price, 10))
      || Number.isNaN(parseInt(taskProfit, 10))) {
      req.flash('error', 'Some of field should be number');
      return res.status(400).redirect(`/tasks/${taskId}`);
    }

    const statement = db.prepare('INSERT INTO hint (hint_price, '
      + 'hint_content, task_id, task_profit) VALUES (?, ?, ?, ?)',
    (error): void => {
      if (error) {
        console.error(error);
        req.flash('error', 'Something happened wrong...');
        return res.redirect(`/tasks/${taskId}`);
      }

      return res.status(200).redirect(`/tasks/${taskId}`);
    });

    statement.run(price, content, taskId, taskProfit);
  });

  server.post(urljoin('/', routes.api, routes.admin.update), isAdmin, (req, res) => {
    const {
      taskId,
      price,
      content,
      taskProfit,
    } = req.body;

    if (Number.isNaN(parseInt(price, 10))
      || Number.isNaN(parseInt(taskProfit, 10))) {
      req.flash('error', 'Some of field should be number');
      return res.status(400).redirect(`/tasks/${taskId}`);
    }

    const statement = db.prepare('UPDATE hint SET hint_price = (?), '
      + 'hint_content = (?), task_profit = (?) '
      + 'WHERE task_id = (?)',
    (error): void => {
      if (error) {
        console.error(error);
        req.flash('error', 'Something happened wrong...');
        return res.redirect(`/tasks/${taskId}`);
      }

      return res.status(200).redirect(`/tasks/${taskId}`);
    });

    statement.run(price, content, taskProfit, taskId);
  });

  server.post(urljoin('/', routes.api, routes.admin.delete), isAdmin, (req, res) => {
    const { taskId } = req.body;

    db.serialize(() => {
      db.get('SELECT * FROM hint WHERE task_id=(?)', taskId, (error, hint) => {
        if (error || !hint) {
          console.error(error);
          req.flash('error', 'Something happened wrong...');
          return res.status(400).redirect(`/tasks/${taskId}`);
        }

        db.run('DELETE FROM uhint WHERE hint_id = (?)', hint.hint_id);
      });

      db.run('DELETE FROM hint WHERE task_id=(?)', taskId, (error) => {
        if (error) {
          console.error(error);
          req.flash('error', 'Something happened wrong...');
        }

        res.status(200).redirect(`/tasks/${taskId}`);
      });
    });
  });

  server.post(urljoin('/', routes.api, routes.coins.pay, ':hintId'), isAuthenticated, (req, res) => {
    const currentUser = req.user as CoinsUser;
    const { hintId } = req.params;

    db.get('SELECT *, h.hint_id from hint as h LEFT JOIN uhint AS uh ON uh.hint_id = h.hint_id '
      + 'WHERE h.hint_id = (?)', hintId, (error, hint) => {
      if (error || !hint) {
        console.error(error || `Purchase incompleted. There is no such hint with ${hintId} id.`);
        return res.status(400).json({
          status: error || `Purchase incompleted. There is no such hint with ${hintId} id.`,
        });
      }

      if (hint.uhint_id) {
        return res.status(200).json({
          status: 'Already has been purchased.',
          id: hint.hint_id,
          hint: hint.hint_content,
          taskId: hint.task_id,
          wallet: currentUser.wallet,
        });
      }

      const currentDate: number = moment().valueOf();

      if (currentUser.wallet >= hint.hint_price) {
        db.run('INSERT INTO uhint (uhint_date, hint_id, user_id) VALUES(?, ?, ?)',
          currentDate, hintId, currentUser.id);

        res.status(200).json({
          status: 'Purchase succeeded.',
          id: hint.hint_id,
          hint: hint.hint_content,
          taskId: hint.task_id,
          wallet: currentUser.wallet,
        });
      } else {
        res.status(400).json({
          status: 'Purchase incompleted. Not enough money.',
          id: hint.hint_id,
          taskId: hint.task_id,
          lacks: currentUser.wallet - hint.hint_price,
          wallet: currentUser.wallet,
        });
      }
    });
  });

  server.post(urljoin('/', routes.api, routes.coins.wallet), isAuthenticated, (req, res) => {
    const currentUser = req.user as CoinsUser;
    const currentDate: number = moment().valueOf();

    db.all('SELECT * FROM uhint AS uh '
      + 'LEFT JOIN hint AS h ON h.hint_id = uh.hint_id '
      + 'LEFT JOIN task as t ON t.task_id = h.task_id '
      + 'LEFT JOIN category AS c ON c.category_id = t.category_id '
      + 'WHERE uh.user_id = (?)', currentUser.id, (error, hints) => {
      if (error || !hints) {
        console.error(error);
        return res.status(400).json({
          status: 'Purchase incompleted. Something bad happened in db.',
        });
      }

      const realHints: any[] = [];
      hints.forEach((hint) => {
        if (realHints.find((val) => (hint.hint_id == val.id))) {
          return;
        }

        realHints.push({
          id: hint.hint_id,
          hint: hint.hint_content,
          taskId: hint.task_id,
          taskName: hint.task_name,
          taskContent: hint.task_content,
          categoryName: hint.category_name,
        });
      });

      res.status(200).json({
        status: `You have ${currentUser.wallet} coins!`,
        userid: currentUser.id,
        date: currentDate,
        wallet: currentUser.wallet,
        hints: realHints,
      });
    });
  });
};

export default coins;
