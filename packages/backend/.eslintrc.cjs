module.exports = {
  extends: ['../../.eslintrc.cjs'],
  ignorePatterns: ['build'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/src/*/*', '!**/src/modules/*'],
            message: 'Please use only import from the top-level folders in src.',
          },
          {
            group: ['**/modules/*/*'],
            message: 'Please use only import from the root of the modules.',
          },
          {
            group: ['**/tests/*/*', '**/support/*/*'],
            message: 'Please use only import from the root of the top-level test folders.',
          },
        ],
      },
    ],
  },
};
