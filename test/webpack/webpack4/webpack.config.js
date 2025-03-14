// eslint-disable-next-line
const { RelativeCiAgentWebpackPlugin } = require('@relative-ci/agent');

module.exports = {
  plugins: [
    new RelativeCiAgentWebpackPlugin({
      includeCommitMessage: false,
    }),
  ],
};
