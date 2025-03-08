// eslint-disable-next-line
const { RelativeCiAgentWebpackPlugin } = require('@relative-ci/agent');

module.exports = {
  mode: 'production',
  context: __dirname,
  plugins: [
    new RelativeCiAgentWebpackPlugin({
      includeCommitMessage: false,
    }),
  ],
};
