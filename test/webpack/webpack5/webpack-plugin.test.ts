// eslint-disable-next-line import/no-extraneous-dependencies
import {
  afterEach, describe, expect, MockedFunction, test, vi,
} from 'vitest';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import baseFetch from 'node-fetch';

import webpack5Stats from '../../__snapshots__/webpack-5-stats.json'; // eslint-disable-line import/no-relative-packages
import {
  ENV_DEFAULT, INGEST_MOCK, clearCustomEnv, getMockRequest, setCustomEnv,
} from '../../utils'; // eslint-disable-line import/no-relative-packages
import appConfig from './webpack.config.js';
import appFailOnErrorConfig from './webpack-fail-on-error.config';

vi.mock('node-fetch');

const fetch = baseFetch as MockedFunction<typeof baseFetch>;

describe('webpack-plugin / webpack5', () => {
  afterEach(() => {
    clearCustomEnv();
    vi.clearAllMocks();
  });

  test('should ingest data successfully', () => new Promise((done) => {
    setCustomEnv();

    fetch.mockReturnValue(
      Promise.resolve({
        json: () => Promise.resolve(INGEST_MOCK),
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

      done(true);
    });
  }));

  test('should warn, not ingest, and not throw on params error', () => new Promise((done) => {
    setCustomEnv({ RELATIVE_CI_KEY: '' });

    const compiler = webpack(appConfig);
    compiler.outputFileSystem = new MemoryFS();

    const log = vi.spyOn(compiler, 'infrastructureLogger');

    compiler.run((error, stats) => {
      expect(stats.hasErrors()).toBe(false);
      expect(error).toBeNull();
      expect(log).toHaveBeenLastCalledWith(
        'RelativeCiAgent',
        'warn',
        expect.arrayContaining([
          expect.objectContaining({ message: expect.stringContaining('"key" parameter is missing') }),
        ]),
      );
      expect(fetch).not.toHaveBeenCalled();

      done(true);
    });
  }));

  test.only('should warn and not throw on ingest error', () => new Promise((done) => {
    setCustomEnv();

    fetch.mockRejectedValueOnce(new Error('Network error'));

    const compiler = webpack(appConfig);
    compiler.outputFileSystem = new MemoryFS();

    const log = vi.spyOn(compiler, 'infrastructureLogger');

    compiler.run((error, stats) => {
      expect(error).toBeNull();
      console.log(stats.toJson().errors);
      expect(stats.hasErrors()).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenLastCalledWith(
        'RelativeCiAgent',
        'warn',
        expect.arrayContaining([
          expect.objectContaining({ message: 'Error ingesting data!' }),
        ]),
      );
      done(true);
    });
  }));

  test('should throw and fail on ingest error when failOnError is true', new Promise((done) => {
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
      done(true);
    }
  }));
});
