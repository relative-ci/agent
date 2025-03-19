// eslint-disable-next-line
const { RelativeCiAgentWebpackPlugin } = require('@relative-ci/webpack-plugin');

module.exports = {
  context: __dirname,
  plugins: [
    new RelativeCiAgentWebpackPlugin({
      includeCommitMessage: false,
      failOnError: true,
    }),
  ],
};
