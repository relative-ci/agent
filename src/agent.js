import dotenv from 'dotenv';
import { set } from 'lodash';

import pck from '../package.json';
import * as LOCALES from '../locales/en';
import send from './send';
import { debug, getCommitMessage, getEnvCI } from './utils';
import { extractWebpackStats } from './extract';

const DEFAULT_ENDPOINT = 'https://api.relative-ci.com/save';
const WEBPACK_STATS = 'webpack.stats';
const SOURCE_EXTRACTORS = {
  [WEBPACK_STATS]: extractWebpackStats,
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

  const params = {
    key: process.env.RELATIVE_CI_KEY,
    endpoint: process.env.RELATIVE_CI_ENDPOINT || DEFAULT_ENDPOINT,
    agentVersion: pck.version,

    ...envCIVars,
    branch: envCIVars.branch || envCIVars.prBranch,

    ...includeCommitMessage ? {
      commitMessage: getCommitMessage(),
    } : {},
  };

  debug('Job parameters', params);

  if (!params.key) {
    throw new Error(LOCALES.AGENT_MISSING_KEY_ERROR);
  }

  if (!params.slug) {
    throw new Error(LOCALES.AGENT_MISSING_SLUG_ERROR);
  }

  if (!params.commit) {
    throw new Error(LOCALES.AGENT_MISSING_COMMIT_ERROR);
  }

  if (!params.branch) {
    throw new Error(LOCALES.AGENT_MISSING_BRANCH_ERROR);
  }

  // Filter only the necessary data
  const filteredData = getFilteredData(artifactsData);

  return send(filteredData, params, logger);
};
