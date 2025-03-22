// eslint-disable-next-line
import RelativeCIAgentPlugin from '@relative-ci/webpack-plugin';

export default {
  entry: {
    main: '../src/index.js',
  },
  mode: 'production',
  plugins: [
    new RelativeCIAgentPlugin({
      includeCommitMessage: false,
    }),
  ],
};
