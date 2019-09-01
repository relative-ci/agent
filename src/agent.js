import dotenv from 'dotenv';
import envCI from 'env-ci';
import { pick, set } from 'lodash';

import pck from '../package.json';
import send from './send';
import { debug, getCommitMessage } from './utils';
import { extractWebpackStats } from './extract';

const CI_ENV_VAR_NAMES = [
  'branch',
  'build',
  'buildUrl',
  'commit',
  'pr',
  'prBranch',
  'slug',
];
const DEFAULT_ENDPOINT = 'https://api.relative-ci.com/save';
const WEBPACK_STATS = 'webpack.stats';
const SOURCE_EXTRACTORS = {
  [WEBPACK_STATS]: extractWebpackStats,
};

const getFilteredData = (artifactsData) => artifactsData.reduce(
  (agg, { key, data, options }) => set(agg, key, SOURCE_EXTRACTORS[key](data, options)),
  {},
);

export const agent = (artifactsData, config) => {
  dotenv.config();
  const ciEnvVars = pick(envCI(), CI_ENV_VAR_NAMES);

  debug('env-ci params', ciEnvVars);

  const { includeCommitMessage } = config;

  const params = {
    key: process.env.RELATIVE_CI_KEY,
    endpoint: process.env.RELATOVE_CI_ENDPOINT || DEFAULT_ENDPOINT,
    agentVersion: pck.version,
    ...ciEnvVars,
    ...includeCommitMessage ? {
      commitMessage: getCommitMessage(),
    } : {},
  };

  debug('Job parameters', params);

  if (!params.commit) {
    throw new Error('"commit" value is missing, make sure the agent is setup correctly!');
  }

  if (!params.branch) {
    throw new Error('"branch" value is missing, make sure the agent is setup correctly!');
  }

  // Filter only the necessary data
  const filteredData = getFilteredData(artifactsData);

  return send(filteredData, params);
};
