// eslint-disable-next-line import/no-extraneous-dependencies
import {
  afterEach, describe, expect, test, vi,
} from 'vitest';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';

// eslint-disable-next-line import/no-relative-packages
import webpackStats from '../../__snapshots__/webpack-4-stats.json';
import {
  ENV_DEFAULT, INGEST_MOCK, clearCustomEnv, getMockRequest, setCustomEnv,
} from '../../utils'; // eslint-disable-line import/no-relative-packages
import appConfig from './webpack.config';
import appFailOnErrorConfig from './webpack-fail-on-error.config';

describe('webpack-plugin / webpack4', () => {
  afterEach(() => {
    clearCustomEnv();
    vi.clearAllMocks();
  });

  test('should ingest data successfully', () => new Promise((done) => {
    setCustomEnv();

    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve(INGEST_MOCK),
    }));

    const compiler = webpack({ ...appConfig, context: __dirname });
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

      done(true);
    });
  }));

  test('should warn, not ingest and not throw on params error', () => new Promise((done) => {
    setCustomEnv({ RELATIVE_CI_KEY: '' });

    const compiler = webpack({ ...appConfig, context: __dirname });
    compiler.outputFileSystem = new MemoryFS();

    compiler.run((error, stats) => {
      expect(stats.hasErrors()).toBe(false);
      expect(error).toEqual(null);
      expect(fetch).not.toHaveBeenCalled();

      done(true);
    });
  }));

  test('should warn and not throw on ingest error', () => new Promise((done) => {
    setCustomEnv();

    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    const compiler = webpack({ ...appConfig, context: __dirname });
    compiler.outputFileSystem = new MemoryFS();

    compiler.run((error, stats) => {
      expect(error).toEqual(null);
      expect(stats.hasErrors()).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1);

      done(true);
    });
  }));

  test('should throw and fail on ingest error when failOnError is true', () => new Promise((done) => {
    setCustomEnv();

    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    const compiler = webpack({ ...appFailOnErrorConfig, context: __dirname });
    compiler.outputFileSystem = new MemoryFS();

    try {
      compiler.run((error, stats) => {
        expect(error).toBeNull();
        expect(stats.hasErrors()).toBe(true);
        expect(stats.toJson().errors[0]).toMatch(/Error ingesting data/);
        done(true);
      });
    } catch (err) {
      console.log(err);
      done(true);
    }
  }));
});
