// eslint-disable-next-line import/no-extraneous-dependencies
import { afterEach, describe, expect, test, vi } from 'vitest';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';

import webpack5Stats from '../../__snapshots__/webpack-5-stats.json'; // eslint-disable-line import/no-relative-packages
import {
  ENV_DEFAULT,
  INGEST_MOCK,
  clearCustomEnv,
  getMockRequest,
  setCustomEnv,
} from '../../utils'; // eslint-disable-line import/no-relative-packages
import appConfig from './webpack.config.js'; // eslint-disable-line import/extensions
import appFailOnErrorConfig from './webpack-fail-on-error.config';

describe('webpack-plugin / webpack5', () => {
  afterEach(() => {
    clearCustomEnv();
    vi.clearAllMocks();
  });

  test('should ingest data successfully', async () => {
    setCustomEnv();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(INGEST_MOCK),
      }),
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
  });

  test('should warn, not ingest, and not throw on params error', async () => {
    setCustomEnv({ RELATIVE_CI_KEY: '' });

    global.fetch = vi.fn(() => Promise.resolve());

    const compiler = webpack({ ...appConfig, context: __dirname });
    compiler.outputFileSystem = new MemoryFS();

    const log = vi.spyOn(compiler, 'infrastructureLogger');

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
    expect(log).toHaveBeenLastCalledWith(
      'RelativeCiAgent',
      'warn',
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining('"key" parameter is missing'),
        }),
      ]),
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  test('should warn and not throw on ingest error', async () => {
    setCustomEnv();

    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    const compiler = webpack({
      ...appConfig,
      context: __dirname,
    });
    compiler.outputFileSystem = new MemoryFS();

    const log = vi.spyOn(compiler, 'infrastructureLogger');

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
    expect(fetch).toHaveBeenCalled();
    expect(log).toHaveBeenLastCalledWith(
      'RelativeCiAgent',
      'warn',
      expect.arrayContaining([expect.objectContaining({ message: 'Error ingesting data!' })]),
    );
  });

  test('should throw and fail on ingest error when failOnError is true', async () => {
    setCustomEnv();

    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

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
    expect(stats.toJson().errors[0]).toMatchObject({ message: /Error ingesting data/ });
  });
});
