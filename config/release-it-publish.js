const config = require('./release-it-common');

module.exports = {
  ...config,
  git: {
    ...config.git,
    commit: false,
    push: false,
    tag: false,
    requireCleanWorkingDir: false,
    requireUpstream: false,
  },
  npm: {
    ...config.npm,
    publish: true,
  },
};
