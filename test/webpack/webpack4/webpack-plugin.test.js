jest.mock('node-fetch');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');
// eslint-disable-next-line
const fetch = require('node-fetch');

const webpackStats = require('../../__snapshots__/webpack-4-stats.json');
const appConfig = require('./webpack.config');
const appFailOnErrorConfig = require('./webpack-fail-on-error.config');
const {
  ENV_DEFAULT, INGEST_MOCK, clearCustomEnv, getMockRequest, setCustomEnv,
} = require('../../utils');

describe('webpack-plugin / webpack4', () => {
  afterEach(() => {
    clearCustomEnv();
    jest.clearAllMocks();
  });

  test('should ingest data successfully', (done) => {
    setCustomEnv();

    fetch.mockReturnValue(
      Promise.resolve({
        json: () => Promise.resolve(INGEST_MOCK),
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

      done();
    });
  });

  test('should warn, not ingest and not throw on params error', (done) => {
    setCustomEnv({ RELATIVE_CI_KEY: '' });

    const compiler = webpack(appConfig);
    compiler.outputFileSystem = new MemoryFS();

    compiler.run((error, stats) => {
      expect(stats.hasErrors()).toBe(false);
      expect(error).toEqual(null);
      expect(fetch).not.toHaveBeenCalled();

      done();
    });
  });

  test('should warn and not throw on ingest error', (done) => {
    setCustomEnv();

    fetch.mockRejectedValueOnce(new Error('Network error'));

    const compiler = webpack(appConfig);
    compiler.outputFileSystem = new MemoryFS();

    compiler.run((error, stats) => {
      expect(error).toEqual(null);
      expect(stats.hasErrors()).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1);
      done();
    });
  });

  test('should throw and fail on ingest error when failOnError is true', (done) => {
    setCustomEnv();

    fetch.mockRejectedValueOnce(new Error('Network error'));

    const compiler = webpack(appFailOnErrorConfig);
    compiler.outputFileSystem = new MemoryFS();

    try {
      compiler.run((error, stats) => {
        expect(error).toBeNull();
        expect(stats.hasErrors()).toBe(true);
        expect(stats.toJson().errors[0]).toMatch(/Error ingesting data/);
        done();
      });
    } catch (err) {
      console.log(err);
      done();
    }
  });
});
