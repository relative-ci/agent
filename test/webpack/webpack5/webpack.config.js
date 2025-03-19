// eslint-disable-next-line
const { RelativeCiAgentWebpackPlugin } = require('@relative-ci/webpack-plugin');

module.exports = {
  mode: 'production',
  plugins: [
    new RelativeCiAgentWebpackPlugin({
      includeCommitMessage: false,
    }),
  ],
};
