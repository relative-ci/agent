import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

import * as LOCALES from './locales/en';
import {
  type IngestConfig,
  type IngestData,
  type IngestParams,
  type IngestResponseSuccess,
  type IngestResponse,
} from './constants';
import { debug, logger as basicLogger, maskObjectProperties } from './utils';

export default async function ingest(
  data: IngestData,
  params: IngestParams,
  config: IngestConfig = {},
  logger: typeof basicLogger = basicLogger,
): Promise<IngestResponseSuccess> {
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
      // On error, catch and log
      logger.warn(`Error saving payload to "${payloadFilepath}"`, err instanceof Error ? err.message : undefined);
    }
  }

  logger.info('Send bundle stats to RelativeCI', `branch=${branch}`, `commit=${commit}`);

  let responseData: IngestResponse | null = null;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    responseData = await response.json() as IngestResponse;
    debug('Response', responseData);
  } catch (error) {
    throw new Error(LOCALES.INGEST_ERROR, { cause: error });
  }

  if (!responseData) {
    throw new Error(LOCALES.INGEST_INVALID_DATA);
  }

  if (responseData.code) {
    throw new Error(responseData.message, { cause: responseData });
  }

  if (!responseData.res) {
    throw new Error(LOCALES.INGEST_INVALID_DATA, { cause: responseData });
  }

  return responseData;
}
