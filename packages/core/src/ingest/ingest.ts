import fs from 'fs/promises';
import path from 'path';
import { gzip as gzipCallback } from 'zlib';
import { promisify } from 'util';

import * as LOCALES from '../locales/en';
import {
  type IngestConfig,
  type IngestData,
  type IngestParams,
  type IngestResponseSuccess,
  type IngestResponse,
} from '../constants';
import {
  debug,
  formatFileSize,
  logger as basicLogger,
  maskObjectProperties,
  type Logger,
} from '../utils';

const gzip = promisify(gzipCallback);

export default async function ingest(
  data: IngestData,
  params: IngestParams,
  config: IngestConfig = {},
  logger: Logger = basicLogger,
): Promise<IngestResponseSuccess> {
  const {
    key,
    endpoint,

    branch,
    baseBranch,
    build,
    buildUrl,
    commit,
    pr,
    slug,
    service,

    commitMessage,

    agentVersion,
    agentType,
  } = params;

  const payload = {
    key,
    project: slug,
    service,
    agentVersion,
    agentType,
    job: {
      commit,
      branch,
      baseBranch,
      prNumber: pr,
      buildNumber: build,
      buildUrl,
      commitMessage,
    },
    rawData: data,
  };

  const { compress, payloadFilepath } = config;

  let requestBody: Buffer | string = JSON.stringify(payload);
  let payloadSize = 0;

  if (compress) {
    requestBody = await gzip(requestBody);
    payloadSize = requestBody.byteLength;
  } else {
    payloadSize = Buffer.byteLength(requestBody);
  }

  debug(`Payload size ${compress ? '(compressed)' : ''}}`, formatFileSize(payloadSize));

  /**
   * Save payload on disk for debugging
   */
  if (payloadFilepath) {
    logger.info('Save payload to', payloadFilepath);

    try {
      const formattedPayload = maskObjectProperties(payload, ['key']);
      const payloadBaseDirectory = path.dirname(payloadFilepath);
      await fs.mkdir(payloadBaseDirectory, { recursive: true });
      await fs.writeFile(payloadFilepath, JSON.stringify(formattedPayload, null, 2));
    } catch (err) {
      // On error, catch and log
      logger.warn(`Error saving payload to "${payloadFilepath}"`, err instanceof Error ? err.message : undefined);
    }
  }

  logger.log('Send bundle stats to RelativeCI', `branch=${branch}`, `commit=${commit}`);

  let responseData: IngestResponse | null = null;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...(compress && {
          'Content-Encoding': 'gzip',
        }),
      },
      body: requestBody,
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
