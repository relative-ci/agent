// eslint-disable-next-line
const RelativeCIAgentPlugin = require('@relative-ci/webpack-plugin');

module.exports = {
  mode: 'production',
  context: __dirname,
  plugins: [
    new RelativeCIAgentPlugin({
      includeCommitMessage: false,
      failOnError: true,
    }),
  ],
};
