// eslint-disable-next-line
const RelativeCIAgentPlugin = require('@relative-ci/webpack-plugin');

module.exports = {
  plugins: [
    new RelativeCIAgentPlugin({
      includeCommitMessage: false,
    }),
  ],
};
