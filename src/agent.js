import dotenv from 'dotenv';
import { set } from 'lodash';

import pck from '../package.json';
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
    throw new Error('"key" value is missing, make sure the agent is setup correctly! Read more on https://relative-ci.com/documentation/setup.');
  }

  if (!params.commit) {
    throw new Error('"commit" value is missing, make sure the agent is setup correctly! Read more on https://relative-ci.com/documentation/setup.');
  }

  if (!params.branch) {
    throw new Error('"branch" value is missing, make sure the agent is setup correctly! Read more on https://relative-ci.com/documentation/setup.');
  }


  // Filter only the necessary data
  const filteredData = getFilteredData(artifactsData);

  return send(filteredData, params, logger);
};
