jest.mock('isomorphic-fetch');
jest.mock('webpack', () => require('webpack4')); // eslint-disable-line

const webpack = require('webpack4');
const MemoryFS = require('memory-fs');
const fetch = require('isomorphic-fetch');
const { merge } = require('lodash');

const pckg = require('../package.json');
const webpackStats = require('./__snapshots__/webpack-4-stats.json');
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
  CIRCLE_BUILD_URL: '#',
  CIRCLE_BUILD_NUM: 123,
  CIRCLE_PR_NUMBER: 10,
};

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

const getMockRequest = (customPayload) => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: JSON.stringify(merge(
    {
      key: '123',
      project: 'organization/project',
      service: 'circleci',
      job: {
        commit: 'abcd1234',
        branch: 'master',
        prNumber: '10',
        buildNumber: '123',
        buildUrl: '#',
      },
      rawData: {
        webpack: {
          stats: {},
        },
      },
      agentVersion: pckg.version,
    },
    customPayload,
  )),
});

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
