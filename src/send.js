import fs from 'fs';
import { get } from 'lodash';
import fetch from 'isomorphic-fetch';

import LOCALES from '../locales/en';
import { debug } from './utils';

export default async (data, params, config, logger) => {
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

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    debug('Response', responseData);

    if (responseData.code) {
      logger.warn(responseData);
      return;
    }

    const { res } = responseData;

    if (!res) {
      logger.warn(LOCALES.GENERIC_ERROR, responseData);
      return;
    }

    const buildNumber = get(res, 'job.internalBuildNumber');
    const buildSizeInfo = get(responseData, 'info.message.txt');

    logger.info(`Job #${buildNumber} done.`);
    logger.info(buildSizeInfo);
  } catch (err) {
    logger.warn(err.message);
    debug('@relative-ci/agent could not send the data', err);
  }
};
