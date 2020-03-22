const { get } = require('lodash');
const fetch = require('isomorphic-fetch');

const LOCALES = require('../locales/en');
const { debug } = require('./utils');

module.exports = (data, options, logger) => {
  const {
    key,
    endpoint,

    branch,
    build,
    buildUrl,
    commit,
    pr,
    slug,

    commitMessage,

    agentVersion,
  } = options;

  const payload = {
    key,
    project: slug,
    job: {
      commit,
      branch,
      prNumber: pr,
      buildNumber: build,
      buildUrl,
      commitMessage,
    },
    rawData: data,
    agentVersion,
  };

  debug('Payload', payload);

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  }).then((res) => res.json())
    .then((response) => {
      debug('Response', response);

      if (response.code) {
        logger.warn(response);
        return;
      }

      const { res } = response;

      if (!res) {
        logger.warn(LOCALES.GENERIC_ERROR, response);
        return;
      }

      const buildNumber = get(res, 'job.internalBuildNumber');
      const buildSizeInfo = get(response, 'info.message.txt');

      logger.info(`Job #${buildNumber} done.`);
      logger.info(buildSizeInfo);
    })
    .catch((err) => logger.warn(err));
};
