jest.mock('isomorphic-fetch');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');
const fetch = require('isomorphic-fetch');

const webpack5Stats = require('./__snapshots__/webpack-5-stats.json');
const {
  ENV_DEFAULT, clearCustomEnv, getMockRequest, setCustomEnv,
} = require('./utils');
const appConfig = require('./webpack/webpack.config');

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
  test('webpack5', (done) => {
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
                ...webpack5Stats,
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
