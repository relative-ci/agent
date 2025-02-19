import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

import * as LOCALES from './locales/en';
import {
  DEFAULT_ENDPOINT,
  type IngestConfig,
  type IngestData,
  type IngestParams,
} from './constants';
import { debug, maskObjectProperties } from './utils';

type IngestResponse = {
  code?: string;
  reportUrl?: string;
  res?: {
    job?: {
      internalBuildNumber?: string;
    };
  };
  info?: {
    message?: {
      txt?: string;
    }
  };
}

export default async function ingest(
  data: IngestData,
  params: IngestParams,
  config: IngestConfig = {},
  logger: typeof console = console,
) {
  const {
    key,
    endpoint = DEFAULT_ENDPOINT,

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
    agentVersion,
    job: {
      commit,
      branch,
      prNumber: pr,
      buildNumber: build,
      buildUrl,
      commitMessage,
    },
    rawData: data,
  };

  const formattedPayload = maskObjectProperties(payload, ['key']);

  debug('Payload size', Buffer.byteLength(JSON.stringify(payload)));

  const { payloadFilepath } = config;

  /**
   * Save payload on disk for debugging
   */
  if (payloadFilepath) {
    logger.info('Save payload to', payloadFilepath);

    try {
      const payloadBaseDirectory = path.dirname(payloadFilepath);
      await fs.mkdir(payloadBaseDirectory, { recursive: true });
      await fs.writeFile(payloadFilepath, JSON.stringify(formattedPayload, null, 2));
    } catch (err) {
      logger.warn('Error saving payload', err instanceof Error ? err.message : undefined);
    }
  }

  logger.info('Send bundle stats to RelativeCI', `branch=${branch}`, `commit=${commit}`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json() as IngestResponse;

    debug('Response', responseData);

    if (responseData.code) {
      logger.warn(responseData);
      return;
    }

    const { res, info, reportUrl } = responseData;

    if (!res) {
      logger.warn(LOCALES.GENERIC_ERROR, responseData);
      return;
    }

    const buildNumber = res?.job?.internalBuildNumber;
    const buildSizeInfo = info?.message?.txt;

    logger.info(`Job #${buildNumber} done.`);
    logger.info(buildSizeInfo);
    logger.info('View bundle report:', reportUrl);
  } catch (err) {
    if (err instanceof Error) {
      logger.warn(err.message);
    }
    debug('@relative-ci/agent could not send the data', err);
  }
}
