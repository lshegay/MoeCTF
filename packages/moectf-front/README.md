# NextJS + Express + Typescript Boilerplate
This is a ready-made NodeJS project which can be used for creating fast web-sites. It includes: NextJS, Express, SCSS, Typescript.

## Commands
`npm run dev` - development mode which allows to write server-side and front-end code with automatic reloadings.

`npm run build` - final code building for production by transforming server-side code from typescript into javascript and NextJS build stuff.

`npm start` - start server in production mode.

## Description
While backend is controlled by Express framework, you can do whatever you want with your databases, routes and etc. NextJS allows to write pages in React using Static Generation and Server Side Generation methods.

Nodemon allows to explicitly reload server-side code by writing `rs` in the terminal.

### Notes
If you use VS Code, you can use `css-modules` feature that allows you to import stylesheets as objects directly in your TypeScript code like this:

```tsx
import styles from '../styles/modules/app.module.scss';

<Component className={styles.someGoodClassName} />
```

> If you have problems with this, try to switch typescript version from VS Code's to workspace's one.
