import { RequestHandler } from 'express';
import { Database } from 'sqlite3';
import crypto from 'crypto';
import passport from 'passport';

import secret from '../settings/secret';

const login = (): RequestHandler => passport.authenticate('local', {
  successRedirect: '/tasks',
  failureRedirect: '/login',
  failureFlash: true,
});

const logout: RequestHandler = (req, res): void => {
  req.logout();
  res.redirect('/');
};

const register = (db: Database): RequestHandler => async (req, res): Promise<void> => {
  const {
    username,
    email,
    password,
    password2
  } = req.body;

  if (password != password2) {
    req.flash('error', 'Passwords are not similar');
    return res.status(403).redirect('/register');
  }

  const nameStatement = db.prepare('SELECT * FROM user WHERE user_name=(?)');
  const emailStatement = db.prepare('SELECT * FROM user WHERE user_email=(?)');
  const insertStatement = db.prepare('INSERT INTO user ('
    + 'user_name, user_email, user_password) VALUES (?, ?, ?)');

  await new Promise((resolve) => {
    nameStatement.get(username, (_, existingUser) => {
      if (existingUser) {
        req.flash('error', 'User with this username already exists');
        return res.status(403).redirect('/register');
      }

      resolve();
    });
  });

  await new Promise((resolve) => {
    emailStatement.get(email, (_, existingUser2) => {
      if (existingUser2) {
        req.flash('error', 'User with this email already exists');
        return res.status(403).redirect('/register');
      }

      resolve();
    });
  });

  const hashPassword = await new Promise<string>((resolve) => {
    crypto.pbkdf2(password, secret.key, 1, 32, 'sha512', (error, derviedKey) => {
      if (error) throw error;

      resolve(derviedKey.toString('hex'));
    });
  });

  await new Promise((resolve) => {
    insertStatement.run([username, email, hashPassword], (error: Error) => {
      if (error) throw error;

      resolve();
    });
  });

  const user: Express.User = await new Promise((resolve) => {
    nameStatement.get(username, (error: Error, user) => {
      if (error) throw error;

      resolve(user);
    });
  });

  await new Promise(() => {
    req.login(user, (error) => {
      if (error) throw error;

      return res.status(200).redirect('/tasks');
    });
  });
};

export {
  login,
  logout,
  register,
};
