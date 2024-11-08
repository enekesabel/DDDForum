module.exports = {
  extends: ['../../.eslintrc.cjs'],
  ignorePatterns: ['build'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['*/modules/*/*'],
            message: 'Please use only import from the root of the modules.',
          },
          {
            group: ['**/shared/*'],
            message: 'Please use only import from the root of shared.',
          },
        ],
      },
    ],
  },
};
