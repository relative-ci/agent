import { type Configuration } from 'webpack';
// eslint-disable-next-line import/no-extraneous-dependencies
import { RelativeCiAgentWebpackPlugin } from '@relative-ci/agent';

const config: Configuration = {
  mode: 'production',
  plugins: [
    new RelativeCiAgentWebpackPlugin({ includeCommitMessage: false }),
  ],
};

export default config;
