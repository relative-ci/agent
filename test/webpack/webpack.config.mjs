// eslint-disable-next-line
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
