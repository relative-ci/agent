/**
 * @typedef {import('../').AgentConfig} AgentConfig
 * @typedef {import('../').AgentArgs} AgentArgs
 * @typedef {import('../').EnvVars} EnvVars
 */
import dotenv from 'dotenv';
import { set } from 'lodash';
import filter from '@bundle-stats/plugin-webpack-filter';

import packageInfo from '../package.json';
import * as LOCALES from '../locales/en';
import send from './send';
import {
  debug, getCommitMessage, getEnvVars, maskObjectProperties,
} from './utils';

const WEBPACK_STATS = 'webpack.stats';
const SOURCE_EXTRACTORS = {
  [WEBPACK_STATS]: filter,
};

const getFilteredData = (artifactsData) => artifactsData.reduce(
  (agg, { key, data, options }) => set(agg, key, SOURCE_EXTRACTORS[key](data, options)),
  {},
);

/**
 * @param {Array<object>} artifactsData
 * @param {AgentConfig} config
 * @param {AgentArgs} [args]
 * @param {Console} [logger]
 * @return {void|Promise<void>}
 */
export const agent = (artifactsData, config, args = {}, logger = console) => {
  dotenv.config();

  const envVars = getEnvVars();

  // Normalized env vars - merge provided args with env vars
  // @type {EnvVars}
  const normalizedEnvVars = {
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

  debug('normalized env vars ', maskObjectProperties(normalizedEnvVars, ['key']));

  const { includeCommitMessage } = config;

  const params = {
    agentVersion: packageInfo.version,

    ...normalizedEnvVars,

    // Get commit message using git if includeCommitMessage is set and
    // there is no --commit-message argument or RELATIVE_CI_COMMIT_MESSAGE
    ...includeCommitMessage && !normalizedEnvVars.commitMessage && {
      commitMessage: getCommitMessage(),
    },
  };

  debug('Job parameters', maskObjectProperties(params, ['key']));

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

  // Filter only the necessary data
  const filteredData = getFilteredData(artifactsData);

  return send(filteredData, params, config, logger);
};
