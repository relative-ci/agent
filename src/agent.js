import dotenv from 'dotenv';
import { set } from 'lodash';
import { filter } from '@bundle-stats/utils/lib/webpack';

import pck from '../package.json';
import * as LOCALES from '../locales/en';
import send from './send';
import { debug, getCommitMessage, getEnvCI } from './utils';

const DEFAULT_ENDPOINT = 'https://api.relative-ci.com/save';
const WEBPACK_STATS = 'webpack.stats';
const SOURCE_EXTRACTORS = {
  [WEBPACK_STATS]: filter,
};

const getFilteredData = (artifactsData) => artifactsData.reduce(
  (agg, { key, data, options }) => set(agg, key, SOURCE_EXTRACTORS[key](data, options)),
  {},
);

export const agent = (artifactsData, config, logger = console) => {
  dotenv.config();
  const envCIVars = getEnvCI();

  debug('env-ci params', envCIVars);

  const { includeCommitMessage } = config;

  let slug = process.env.RELATIVE_CI_SLUG;

  if (!slug) {
    debug('RELATIVE_CI_SLUG not available, using env-ci');
    slug = envCIVars.slug;
  }

  const params = {
    key: process.env.RELATIVE_CI_KEY,
    endpoint: process.env.RELATIVE_CI_ENDPOINT || DEFAULT_ENDPOINT,
    agentVersion: pck.version,

    ...envCIVars,
    branch: envCIVars.branch || envCIVars.prBranch,
    slug,

    ...includeCommitMessage ? {
      commitMessage: getCommitMessage(),
    } : {},
  };

  debug('Job parameters', params);

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

  return send(filteredData, params, logger);
};
