import { type Configuration } from 'webpack';
// eslint-disable-next-line
import RelativeCIAgentPlugin from '@relative-ci/webpack-plugin';

const config: Configuration = {
  mode: 'production',
  context: __dirname,
  plugins: [
    new RelativeCIAgentPlugin({ includeCommitMessage: false }),
  ],
};

export default config;
