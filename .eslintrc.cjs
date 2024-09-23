module.exports = {
  root: true,
  env: { es2020: true, node: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  rules: {
    // Allow unused variables starting with exactly one underscore.
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_[^_].*$|^_$',
        varsIgnorePattern: '^_[^_].*$|^_$',
        caughtErrorsIgnorePattern: '^_[^_].*$|^_$',
      },
    ],
  },
};
