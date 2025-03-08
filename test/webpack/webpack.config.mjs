// eslint-disable-next-line import/no-extraneous-dependencies
import { RelativeCiAgentWebpackPlugin } from '@relative-ci/agent';

export default {
  entry: {
    main: './src/index.js',
  },
  mode: 'production',
  plugins: [
    new RelativeCiAgentWebpackPlugin({
      includeCommitMessage: false,
    }),
  ],
};
