module.exports = {
  extends: 'airbnb-base',
  env: {
    'jest/globals': true,
  },
  globals: {
    describe: true,
    it: true,
  },
  rules: {
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.js', '*.config.mjs'] }],
  },
  plugins: ['jest'],
};
