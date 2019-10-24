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
    const user = req.user as User;

    if (req.method == 'POST' && req.path == urljoin('/', routes.api, routes.admin.hint)
      && req.isAuthenticated() && user.admin) {
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
      && req.isAuthenticated() && user.admin) {
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
      && req.isAuthenticated() && user.admin) {
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
      && req.isAuthenticated() && user.admin) {
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

    if (req.method == 'POST' && req.path == urljoin('/', routes.api, routes.coins.pay)
      && req.isAuthenticated()) {
      const { id } = req.query;

      db.get('SELECT * from uhint as uh LEFT JOIN hint as h ON '
        + 'h.hint_id = uh.hint_id WHERE uh.hint_id = (?) '
        + 'AND uh.user_id = (?)', id, user.id, (error, uhint) => {
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
          });
        }

        db.get('SELECT SUM(h.task_profit) FROM hint AS h '
          + 'LEFT JOIN stask AS s ON '
          + 's.task_id = h.task_id '
          + 'WHERE s.user_id = (?)', user.id, (error, response) => {
          if (error || !response) {
            console.error(error);
            return res.status(200).json({
              status: 'Purchase incompleted. UserID is unknown.',
            });
          }

          const money = userCash + (response['SUM(h.task_profit)'] || 0);

          db.get('SELECT SUM(h.hint_price) FROM uhint AS uh '
            + 'LEFT JOIN hint AS h ON h.hint_id = uh.hint_id '
            + 'LEFT JOIN stask AS s ON s.task_id = h.task_id '
            + 'WHERE s.user_id = (?)', user.id, (_, response) => {
            if (error || !response) {
              console.error(error);
              return res.status(200).json({
                status: 'Purchase incompleted. Something bad happened in db.',
              });
            }
            const expenses = response['SUM(h.hint_price)'] || 0;

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
              const wallet = Math.abs(money - expenses);
              const currentDate: number = moment().valueOf();

              if (wallet >= realHint.price) {
                db.run('INSERT INTO uhint (uhint_date, hint_id, user_id) VALUES(?, ?, ?)',
                  currentDate, id, user.id);

                res.status(200).json({
                  status: 'Purchase succeeded.',
                  id: realHint.id,
                  hint: realHint.content,
                  taskId: realHint.taskId,
                  deduction: realHint.price - wallet,
                });
              } else {
                res.status(200).json({
                  status: 'Purchase incompleted. Not enough money.',
                  id: realHint.id,
                  taskId: realHint.taskId,
                  lacks: realHint.price - wallet,
                });
              }
            });
          });
        });
      });

      return;
    }

    if (req.method == 'POST' && req.path == urljoin('/', routes.api, routes.coins.wallet)
      && req.isAuthenticated()) {
      db.get('SELECT SUM(h.task_profit) FROM hint AS h '
        + 'LEFT JOIN stask AS s ON '
        + 's.task_id = h.task_id '
        + 'WHERE s.user_id = (?)', user.id, (error, response) => {
        if (error || !response) {
          console.error(error);
          return res.status(200).json({
            status: 'Purchase incompleted. UserID is unknown.',
          });
        }

        const money = userCash + (response['SUM(h.task_profit)'] || 0);

        db.get('SELECT SUM(h.hint_price) FROM uhint AS uh '
          + 'LEFT JOIN hint AS h ON h.hint_id = uh.hint_id '
          + 'LEFT JOIN stask AS s ON s.task_id = h.task_id '
          + 'WHERE s.user_id = (?)', user.id, (_, response) => {
          if (error || !response) {
            console.error(error);
            return res.status(200).json({
              status: 'Purchase incompleted. Something bad happened in db.',
            });
          }
          const expenses = response['SUM(h.hint_price)'] || 0;
          const wallet = Math.abs(money - expenses);
          const currentDate: number = moment().valueOf();

          db.all('SELECT * FROM uhint AS uh '
            + 'LEFT JOIN hint AS h ON '
            + 'h.hint_id = uh.hint_id '
            + 'WHERE uh.user_id = (?)', user.id, (error, hints) => {
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
              status: `You have ${wallet} coins!`,
              userid: user.id,
              date: currentDate,
              wallet,
              hints: realHints,
            });
          });
        });
      });

      return;
    }

    if (req.method == 'POST' && req.path == urljoin('/', routes.api, routes.coins.hint)
      && req.isAuthenticated()) {
      const { id } = req.query;

      db.get('SELECT * FROM hint AS h WHERE h.hint_id = (?)', id, (error, hint) => {
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
        });
      });

      return;
    }

    if (req.method == 'POST' && req.path == urljoin('/', routes.api, routes.coins.hints)
      && req.isAuthenticated()) {
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
        });
      });

      return;
    }

    next();
  };

  return handler;
};

export default coins;
