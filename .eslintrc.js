module.exports = {
  extends: 'airbnb-base',
  env: {
    'jest/globals': true,
  },
  globals: {
    AGENT_VERSION: true,
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
