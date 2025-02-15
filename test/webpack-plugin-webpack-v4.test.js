jest.mock('isomorphic-fetch');
jest.mock('webpack', () => require('webpack4')); // eslint-disable-line

const webpack = require('webpack4');
const MemoryFS = require('memory-fs');
const fetch = require('isomorphic-fetch');

const webpackStats = require('./__snapshots__/webpack-4-stats.json');
const appConfig = require('./webpack/webpack.config');
const {
  ENV_DEFAULT, clearCustomEnv, getMockRequest, setCustomEnv,
} = require('./utils');

const MOCK_RESULT = {
  res: {
    job: {
      internalBuildNumber: 1,
    },
  },
  info: {
    message: {
      txt: 'Hello world!',
    },
  },
};

describe('webpack-plugin', () => {
  test('webpack4', (done) => {
    setCustomEnv();

    fetch.mockReturnValue(
      Promise.resolve({
        json: () => Promise.resolve(MOCK_RESULT),
      }),
    );

    const compiler = webpack(appConfig);
    compiler.outputFileSystem = new MemoryFS();

    compiler.run((error, stats) => {
      expect(error).toEqual(null);
      expect(stats.hasErrors()).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        ENV_DEFAULT.RELATIVE_CI_ENDPOINT,
        getMockRequest({
          rawData: {
            webpack: {
              stats: {
                hash: stats.hash,
                ...webpackStats,
              },
            },
          },
        }),
      );

      clearCustomEnv();
      jest.clearAllMocks();
      done();
    });
  });
});
