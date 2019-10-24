import {
  RequestHandler,
  Request,
  Response,
  NextFunction
} from 'express';
import urljoin from 'url-join';
import { Database } from 'sqlite3';
import moment from 'moment';

import User from '../interfaces/User';

export interface CoinsOptions {
  db: Database;
  userCash: number;
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
  content: string;
  taskId: number;
  taskProfit: number;
}

export interface CoinsUser extends User {
  wallet: number;
}


const coins = (options: CoinsOptions): RequestHandler => {
  const def: CoinsOptions = {
    db: options.db,
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
        hint: 'hint',
        hints: 'hints',
        pay: 'pay',
        wallet: 'wallet',
      },
    },
  };

  const opt = { ...def, ...options };
  const { routes, db, userCash } = opt;

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

  const handler = (req: Request, res: Response, next: NextFunction): void => {
    const currentUser = req.user as CoinsUser;

    if (req.method == 'POST' && req.path == '/api/users') {
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
          console.error(error);
          return res.status(200).json({
            status: 'Purchase incompleted. UserID is unknown.',
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
        res.json({ users: newUsers });
      });

      return;
    }

    if (req.isAuthenticated()) {
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
          throw error;
        }

        const money = userCash + (nums['SUM(h.task_profit)'] || 0);
        const expenses = nums['SUM(ht.hint_price)'] || 0;
        currentUser.wallet = money - expenses;

        if (req.method == 'POST' && req.path == urljoin('/', routes.api, routes.admin.hint)
        && currentUser.admin) {
          const { id } = req.query;

          db.get('SELECT * FROM hint AS h WHERE h.task_id = (?)', id, (error, hint) => {
            if (error) {
              console.error(error);
              return res.redirect(`/tasks/${id}`);
            }

            if (!hint) {
              return res.status(200).json({
                status: 'Fetching completed. No hint was found.',
              });
            }

            const realHint: Hint = {
              id: hint.hint_id,
              price: hint.hint_price,
              content: hint.hint_content,
              taskId: hint.task_id,
              taskProfit: hint.task_profit,
            };

            res.status(200).json({
              status: 'Fetching completed. Small info.',
              id: realHint.id,
              price: realHint.price,
              content: hint.hint_content,
              taskId: realHint.taskId,
              taskProfit: hint.task_profit,
            });
          });

          return;
        }

        if (req.method == 'POST' && req.path == urljoin('/', routes.api, routes.admin.create)
          && currentUser.admin) {
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
            return res.redirect(`/tasks/${taskId}`);
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
          return;
        }

        if (req.method == 'POST' && req.path == urljoin('/', routes.api, routes.admin.update)
          && currentUser.admin) {
          const {
            taskId,
            price,
            content,
            taskProfit,
          } = req.body;

          if (Number.isNaN(parseInt(price, 10))
            || Number.isNaN(parseInt(taskProfit, 10))) {
            req.flash('error', 'Some of field should be number');
            return res.redirect(`/tasks/${taskId}`);
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
          return;
        }

        if (req.method == 'POST' && req.path == urljoin('/', routes.api, routes.admin.delete)
          && currentUser.admin) {
          const { taskId } = req.body;

          db.serialize(() => {
            db.get('SELECT * FROM hint WHERE task_id=(?)', taskId, (error, hint) => {
              if (error || !hint) {
                console.error(error);
                req.flash('error', 'Something happened wrong...');
                return res.redirect(`/tasks/${taskId}`);
              }

              db.run('DELETE FROM uhint WHERE hint_id = (?)', hint.hint_id);
            });

            db.run('DELETE FROM hint WHERE task_id=(?)', taskId, (error) => {
              if (error) {
                console.error(error);
                req.flash('error', 'Something happened wrong...');
              }

              res.redirect(`/tasks/${taskId}`);
            });
          });

          return;
        }

        if (req.method == 'POST' && req.path == urljoin('/', routes.api, routes.coins.pay)) {
          const { id } = req.query;

          db.get('SELECT * from uhint as uh LEFT JOIN hint as h ON '
            + 'h.hint_id = uh.hint_id WHERE uh.hint_id = (?) '
            + 'AND uh.user_id = (?)', id, currentUser.id, (error, uhint) => {
            if (error) {
              console.error(error);
              return res.status(200).json({
                status: 'Purchase incompleted. Something bad happened in db.',
              });
            }
            if (uhint) {
              const realHint: Hint = {
                id: uhint.hint_id,
                price: uhint.hint_price,
                content: uhint.hint_content,
                taskId: uhint.task_id,
                taskProfit: uhint.task_profit,
              };

              return res.status(200).json({
                status: 'Already has been purchased.',
                id: realHint.id,
                hint: realHint.content,
                taskId: realHint.taskId,
                wallet: currentUser.wallet,
              });
            }

            db.get('SELECT * FROM hint AS h WHERE h.hint_id = (?)', id, (error, hint) => {
              if (error || !hint) {
                console.error(error);
                return res.status(200).json({
                  status: `Purchase incompleted. There is no such hint with ${id} id.`,
                });
              }
              const realHint: Hint = {
                id: hint.hint_id,
                price: hint.hint_price,
                content: hint.hint_content,
                taskId: hint.task_id,
                taskProfit: hint.task_profit,
              };
              const currentDate: number = moment().valueOf();

              if (currentUser.wallet >= realHint.price) {
                db.run('INSERT INTO uhint (uhint_date, hint_id, user_id) VALUES(?, ?, ?)',
                  currentDate, id, currentUser.id);

                res.status(200).json({
                  status: 'Purchase succeeded.',
                  id: realHint.id,
                  hint: realHint.content,
                  taskId: realHint.taskId,
                  residual: currentUser.wallet - realHint.price,
                  wallet: currentUser.wallet,
                });
              } else {
                res.status(200).json({
                  status: 'Purchase incompleted. Not enough money.',
                  id: realHint.id,
                  taskId: realHint.taskId,
                  lacks: currentUser.wallet - realHint.price,
                  wallet: currentUser.wallet,
                });
              }
            });
          });

          return;
        }

        if (req.method == 'POST' && req.path == urljoin('/', routes.api, routes.coins.wallet)) {
          const currentDate: number = moment().valueOf();

          db.all('SELECT * FROM uhint AS uh '
            + 'LEFT JOIN hint AS h ON '
            + 'h.hint_id = uh.hint_id '
            + 'WHERE uh.user_id = (?)', currentUser.id, (error, hints) => {
            if (error || !hints) {
              console.error(error);
              return res.status(200).json({
                status: 'Purchase incompleted. Something bad happened in db.',
              });
            }

            const realHints: any[] = [];
            hints.forEach((hint) => {
              const realHint: Hint = {
                id: hint.hint_id,
                price: hint.hint_price,
                content: hint.hint_content,
                taskId: hint.task_id,
                taskProfit: hint.task_profit,
              };

              if (realHints.find((val) => (realHint.id == val.id))) {
                return;
              }

              realHints.push({
                id: realHint.id,
                hint: realHint.content,
                taskId: realHint.taskId,
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

          return;
        }

        if (req.method == 'POST' && req.path == urljoin('/', routes.api, routes.coins.hint)) {
          const { id } = req.query;

          db.get('SELECT * FROM hint AS h WHERE h.task_id = (?)', id, (error, hint) => {
            if (error || !hint) {
              console.error(error);
              return res.status(200).json({
                status: `Fetching incompleted. There is no such hint with ${id} id.`,
              });
            }
            const realHint: Hint = {
              id: hint.hint_id,
              price: hint.hint_price,
              content: hint.hint_content,
              taskId: hint.task_id,
              taskProfit: hint.task_profit,
            };

            res.status(200).json({
              status: 'Fetching completed. Small info.',
              id: realHint.id,
              taskId: realHint.taskId,
              price: realHint.price,
              wallet: currentUser.wallet,
            });
          });

          return;
        }

        if (req.method == 'POST' && req.path == urljoin('/', routes.api, routes.coins.hints)) {
          const { id } = req.query;

          db.all('SELECT * FROM hint AS h WHERE h.task_id = (?)', id, (error, hints) => {
            if (error || !hints) {
              console.error(error);
              return res.status(200).json({
                status: `Fetching incompleted. There is no such hints which attached to ${id} task.`,
              });
            }

            const realHints: any[] = [];
            hints.forEach((hint) => {
              const realHint: Hint = {
                id: hint.hint_id,
                price: hint.hint_price,
                content: hint.hint_content,
                taskId: hint.task_id,
                taskProfit: hint.task_profit,
              };

              realHints.push({
                id: realHint.id,
                taskId: realHint.taskId,
                price: realHint.price,
              });
            });

            res.status(200).json({
              status: `Fetching completed. All hints attached to ${id} task`,
              hints: realHints,
              wallet: currentUser.wallet,
            });
          });

          return;
        }

        next();
      });
    } else {
      next();
    }
  };

  return handler;
};

export default coins;
