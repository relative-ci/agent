import dotenv from 'dotenv';
import { set } from 'lodash';
import filter from '@bundle-stats/plugin-webpack-filter';

import {
  type AgentArgs, type AgentConfig, type IngestParams, type EnvVars,
  type IngestData,
  type Source,
  type SourceFilterFn,
  SOURCE_WEBPACK_STATS,
} from './constants';
import * as LOCALES from './locales/en';
import ingest from './ingest';
import {
  debug, getCommitMessage, getEnvVars, maskObjectProperties,
} from './utils';

const SOURCE_FILTERS: Record<Source, SourceFilterFn> = {
  // @ts-expect-error incorrect types
  [SOURCE_WEBPACK_STATS]: filter.default,
} as const;

type Artifact = {
  key: string;
  data: unknown;
}

/**
 * Filter artifact data based on the source type and map them by key
 */
function filterData(artifactsData: Array<Artifact>): IngestData {
  const dataByKey = {};

  artifactsData.forEach(({ key, data }) => {
    set(
      dataByKey,
      key,
      SOURCE_FILTERS[key as Source](data),
    );
  });

  return dataByKey;
}

export default async function agent(
  artifactsData: Array<Artifact>,
  config: AgentConfig,
  args: AgentArgs = {},
  logger = console,
): Promise<void> {
  dotenv.config();

  const envVars = getEnvVars();

  // Normalized params - merge provided args with env vars
  const normalizedParams: Partial<EnvVars> = {
    slug: args.slug || envVars.slug,
    branch: args.branch || envVars.branch,
    pr: args.pr || envVars.pr,
    commit: args.commit || envVars.commit,

    build: envVars.build,
    buildUrl: envVars.buildUrl,
    isCi: envVars.isCi,
    service: envVars.service,

    commitMessage: args.commitMessage || envVars.commitMessage,
    key: envVars.key,
    endpoint: envVars.endpoint,
  };

  debug(
    'normalized parameters - agent configuration with environmental variables fallback',
    maskObjectProperties(normalizedParams, ['key']),
  );

  const { includeCommitMessage } = config;

  const params = {
    agentVersion: AGENT_VERSION,

    ...normalizedParams,

    // Get commit message using git if includeCommitMessage is set and
    // there is no --commit-message argument or RELATIVE_CI_COMMIT_MESSAGE
    ...includeCommitMessage && !normalizedParams.commitMessage && {
      commitMessage: getCommitMessage(),
    },
  };

  debug('job parameters', maskObjectProperties(params, ['key']));

  // Validate parameters
  if (!params.key) {
    return logger.warn(LOCALES.AGENT_MISSING_KEY_ERROR);
  }

  if (!params.slug) {
    return logger.warn(LOCALES.AGENT_MISSING_SLUG_ERROR);
  }

  if (!params.commit) {
    return logger.warn(LOCALES.AGENT_MISSING_COMMIT_ERROR);
  }

  if (!params.branch) {
    return logger.warn(LOCALES.AGENT_MISSING_BRANCH_ERROR);
  }

  const ingestData = filterData(artifactsData);

  return ingest(ingestData, params as IngestParams, config, logger);
}
