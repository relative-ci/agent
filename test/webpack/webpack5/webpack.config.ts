import { type Configuration } from 'webpack';
// eslint-disable-next-line
import { RelativeCiAgentWebpackPlugin } from '@relative-ci/webpack-plugin';

const config: Configuration = {
  mode: 'production',
  context: __dirname,
  plugins: [
    new RelativeCiAgentWebpackPlugin({ includeCommitMessage: false }),
  ],
};

export default config;
