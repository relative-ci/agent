jest.mock('isomorphic-fetch');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');
const fetch = require('isomorphic-fetch');

const pckg = require('../package.json');
const appConfig = require('./webpack/webpack.config');

const ENV_DEFAULT = {
  CI: 'true',
  RELATIVE_CI_ENDPOINT: 'http://localhost/save',
  RELATIVE_CI_KEY: '123',
  CIRCLECI: 'true',
  CIRCLE_SHA1: 'abcd1234',
  CIRCLE_BRANCH: 'master',
  CIRCLE_PROJECT_USERNAME: 'organization',
  CIRCLE_PROJECT_REPONAME: 'project',
};

const setCustomEnv = (customEnv = {}) => {
  const envVars = { ...ENV_DEFAULT, ...customEnv };

  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
};

const clearCustomEnv = () => {
  Object.keys(ENV_DEFAULT).forEach((key) => {
    process.env[key] = undefined;
  });
};

describe('webpack-plugin', () => {
  test('should send data to the service', (done) => {
    setCustomEnv();

    fetch.mockReturnValue(
      Promise.resolve({
        json: () => Promise.resolve({
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
        }),
      }),
    );

    const compiler = webpack(appConfig);
    compiler.outputFileSystem = new MemoryFS();

    compiler.run((error, stats) => {
      expect(error).toEqual(null);
      expect(stats.hasErrors()).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(ENV_DEFAULT.RELATIVE_CI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          key: '123',
          project: 'organization/project',
          service: 'circleci',
          job: {
            commit: 'abcd1234',
            branch: 'master',
          },
          rawData: {
            webpack: {
              stats: {
                hash: stats.hash,
                assets: [{ name: 'main.js', size: 957 }],
                entrypoints: { main: { assets: ['main.js'] } },
                chunks: [
                  {
                    id: 0,
                    entry: true,
                    initial: true,
                    files: ['main.js'],
                    names: ['main'],
                  },
                ],
                modules: [{ name: './src/index.js', size: 29, chunks: [0] }],
              },
            },
          },
          agentVersion: pckg.version,
        }),
      });

      clearCustomEnv();
      done();
    });
  });
});
