// eslint-disable-next-line
const { RelativeCiAgentWebpackPlugin } = require('@relative-ci/webpack-plugin');

module.exports = {
  plugins: [
    new RelativeCiAgentWebpackPlugin({
      includeCommitMessage: false,
    }),
  ],
};
