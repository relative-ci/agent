const fs = require('fs');
const { get } = require('lodash');
const fetch = require('isomorphic-fetch');

const LOCALES = require('../locales/en');
const { debug } = require('./utils');

module.exports = (data, params, config, logger) => {
  const {
    key,
    endpoint,

    branch,
    build,
    buildUrl,
    commit,
    pr,
    slug,
    service,

    commitMessage,

    agentVersion,
  } = params;

  const payload = {
    key,
    project: slug,
    service,
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

  const { payloadFilepath } = config;

  debug('Payload', payload);
  debug('Payload size', Buffer.byteLength(JSON.stringify(payload)));

  if (payloadFilepath) {
    logger.info('Save payload to', payloadFilepath);

    try {
      // Obfuscate private data
      const output = { ...payload, key: '***' };
      fs.writeFileSync(payloadFilepath, JSON.stringify(output, null, 2));
    } catch (err) {
      logger.warn('Error saving payload', err.message);
    }
  }

  logger.info('Send stats to RelativeCI', `branch=${branch}`, `commit=${commit}`);

  return fetch(endpoint, {
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
