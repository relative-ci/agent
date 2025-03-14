// eslint-disable-next-line
const { RelativeCiAgentWebpackPlugin } = require('@relative-ci/agent');

module.exports = {
  mode: 'production',
  plugins: [
    new RelativeCiAgentWebpackPlugin({
      includeCommitMessage: false,
    }),
  ],
};
