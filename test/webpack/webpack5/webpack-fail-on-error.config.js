// eslint-disable-next-line
const { RelativeCiAgentWebpackPlugin } = require('@relative-ci/webpack-plugin');

module.exports = {
  mode: 'production',
  context: __dirname,
  plugins: [
    new RelativeCiAgentWebpackPlugin({
      includeCommitMessage: false,
      failOnError: true,
    }),
  ],
};
