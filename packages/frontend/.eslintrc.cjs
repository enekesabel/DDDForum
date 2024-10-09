module.exports = {
  env: { browser: true },
  extends: ['../../.eslintrc.cjs'],
  ignorePatterns: ['dist'],
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
