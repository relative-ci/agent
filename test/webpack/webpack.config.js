const { RelativeCiAgentWebpackPlugin } = require('../..');

module.exports = {
  mode: 'production',
  context: __dirname,
  plugins: [
    new RelativeCiAgentWebpackPlugin(),
  ],
};
