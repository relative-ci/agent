jest.mock('node-fetch');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');
const fetch = require('node-fetch');

const webpack5Stats = require('./__snapshots__/webpack-5-stats.json');
const {
  ENV_DEFAULT, clearCustomEnv, getMockRequest, setCustomEnv,
} = require('./utils');
const appConfig = require('./webpack/webpack.config');
const appFailOnErrorConfig = require('./webpack/webpack-fail-on-error.config');

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

describe('webpack-plugin / webpack5', () => {
  afterEach(() => {
    clearCustomEnv();
    jest.clearAllMocks();
  });

  test('should ingest data successfully', (done) => {
    setCustomEnv();

    fetch.mockReturnValue(
      Promise.resolve({
        json: () => Promise.resolve(MOCK_RESULT),
      }),
    );

    const compiler = webpack(appConfig);
    compiler.outputFileSystem = new MemoryFS();

    compiler.run((error, stats) => {
      expect(error).toBeNull();
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

      done();
    });
  });

  test('should warn, not ingest and not throw on params error', (done) => {
    setCustomEnv({ RELATIVE_CI_KEY: '' });

    const warn = jest.spyOn(console, 'warn');

    const compiler = webpack(appConfig);
    compiler.outputFileSystem = new MemoryFS();

    compiler.run((error, stats) => {
      expect(stats.hasErrors()).toBe(false);
      expect(error).toBeNull();
      expect(warn).toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();

      done();
    });
  });

  test('should warn and not throw on ingest error', (done) => {
    setCustomEnv();

    const warn = jest.spyOn(console, 'warn');
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const compiler = webpack(appConfig);
    compiler.outputFileSystem = new MemoryFS();

    compiler.run((error, stats) => {
      expect(error).toBeNull();
      expect(stats.hasErrors()).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalled();
      done();
    });
  });

  test.only('should throw and fail on ingest error when failOnError is true', (done) => {
    setCustomEnv();

    fetch.mockRejectedValueOnce(new Error('Network error'));

    const compiler = webpack(appFailOnErrorConfig);
    compiler.outputFileSystem = new MemoryFS();

    try {
      compiler.run((error, stats) => {
        expect(error).toBeNull();
        expect(stats.hasErrors()).toBe(true);
        expect(stats.toJson().errors[0]).toMatchObject({ message: /Error ingesting data/ });
        done();
      });
    } catch (err) {
      console.log(err);
      done();
    }
  });
});
