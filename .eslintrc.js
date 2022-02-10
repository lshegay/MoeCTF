module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'xo-space',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'object-curly-spacing': ['error', 'always'],
    'arrow-parens': ['error', 'always'],
  },
};
