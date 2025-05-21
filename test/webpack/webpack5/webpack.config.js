// eslint-disable-next-line
const RelativeCIAgentPlugin = require('@relative-ci/webpack-plugin');

module.exports = {
  mode: 'production',
  plugins: [
    new RelativeCIAgentPlugin({
      includeCommitMessage: false,
    }),
  ],
};
