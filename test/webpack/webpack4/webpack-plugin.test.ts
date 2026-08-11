// eslint-disable-next-line import/no-extraneous-dependencies
import { afterEach, describe, expect, test, vi } from 'vitest';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';

// eslint-disable-next-line import/no-relative-packages
import webpackStats from '../../__snapshots__/webpack-4-stats.json';
import {
  ENV_DEFAULT,
  INGEST_MOCK,
  clearCustomEnv,
  getMockRequest,
  setCustomEnv,
} from '../../utils'; // eslint-disable-line import/no-relative-packages
import appConfig from './webpack.config';
import appFailOnErrorConfig from './webpack-fail-on-error.config';

describe('webpack-plugin / webpack4', () => {
  afterEach(() => {
    clearCustomEnv();
    vi.clearAllMocks();
  });

  test('should ingest data successfully', async () => {
    setCustomEnv();

    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(INGEST_MOCK),
        }),
      ),
    );

    const compiler = webpack({ ...appConfig, context: __dirname });
    compiler.outputFileSystem = new MemoryFS();

    const stats = await new Promise<webpack.Stats>((resolve, reject) => {
      compiler.run((error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      });
    });

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
  });

  test('should warn, not ingest and not throw on params error', async () => {
    setCustomEnv({ RELATIVE_CI_KEY: '' });

    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve()),
    );

    const compiler = webpack({ ...appConfig, context: __dirname });
    compiler.outputFileSystem = new MemoryFS();

    const stats = await new Promise<webpack.Stats>((resolve, reject) => {
      compiler.run((error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      });
    });

    expect(stats.hasErrors()).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  test('should warn and not throw on ingest error', async () => {
    setCustomEnv();

    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Network error'))),
    );

    const compiler = webpack({ ...appConfig, context: __dirname });
    compiler.outputFileSystem = new MemoryFS();

    const stats = await new Promise<webpack.Stats>((resolve, reject) => {
      compiler.run((error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      });
    });

    expect(stats.hasErrors()).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('should throw and fail on ingest error when failOnError is true', async () => {
    setCustomEnv();

    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Network error'))),
    );

    const compiler = webpack({ ...appFailOnErrorConfig, context: __dirname });
    compiler.outputFileSystem = new MemoryFS();

    const stats = await new Promise<webpack.Stats>((resolve, reject) => {
      compiler.run((error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      });
    });

    expect(stats.hasErrors()).toBe(true);
    expect(stats.toJson().errors[0]).toMatch(/Error ingesting data/);
  });
});
