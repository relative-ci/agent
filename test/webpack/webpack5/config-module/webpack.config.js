// eslint-disable-next-line
import { RelativeCiAgentWebpackPlugin } from '@relative-ci/webpack-plugin';

export default {
  entry: {
    main: '../src/index.js',
  },
  mode: 'production',
  plugins: [
    new RelativeCiAgentWebpackPlugin({
      includeCommitMessage: false,
    }),
  ],
};
