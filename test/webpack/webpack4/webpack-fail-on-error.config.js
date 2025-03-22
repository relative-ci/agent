// eslint-disable-next-line
const RelativeCIAgentPlugin = require('@relative-ci/webpack-plugin');

module.exports = {
  context: __dirname,
  plugins: [
    new RelativeCIAgentPlugin({
      includeCommitMessage: false,
      failOnError: true,
    }),
  ],
};
