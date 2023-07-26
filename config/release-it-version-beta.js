const config = require('./release-it-common');

module.exports = {
  ...config,
  git: {
    ...config.git,
    // eslint-disable-next-line no-template-curly-in-string
    commitMessage: 'DROP - release ${version}',
  },
};
