const http = require('http');
const _ = require('lodash');
const packageInfo = require('../packages/webpack-plugin/package.json');

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
  CIRCLE_BUILD_NUM: '123',
  CIRCLE_PR_NUMBER: '10',
};

module.exports.ENV_DEFAULT = ENV_DEFAULT;

module.exports.getMockRequest = (customPayload) => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: JSON.stringify(_.merge(
    {
      key: '123',
      project: 'organization/project',
      service: 'circleci',
      agentVersion: packageInfo.version,
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
    },
    customPayload,
  )),
});

/**
 * @param {Record<string, string>} customEnv
 * @returns {void}
 */
module.exports.setCustomEnv = (customEnv = {}) => {
  const envVars = { ...ENV_DEFAULT, ...customEnv };

  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
};

/**
 * @returns {void}
 */
module.exports.clearCustomEnv = () => {
  Object.keys(ENV_DEFAULT).forEach((key) => {
    process.env[key] = undefined;
  });
};

const INGEST_MOCK = {
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

const MOCK_SERVER_PORT = 5998;

module.exports.MOCK_SERVER_PORT = MOCK_SERVER_PORT;
module.exports.MOCK_SERVER_URL = `http://localhost:${MOCK_SERVER_PORT}`;

module.exports.INGEST_MOCK = INGEST_MOCK;

module.exports.serve = () => http.createServer(
  (__, res) => {
    res.write(JSON.stringify(INGEST_MOCK));
    res.end();
  },
).listen(MOCK_SERVER_PORT);
