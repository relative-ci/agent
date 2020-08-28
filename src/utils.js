const childProcess = require('child_process');
const { pick } = require('lodash');
const envCI = require('@relative-ci/env-ci');

const CI_ENV_VAR_NAMES = [
  'branch',
  'build',
  'buildUrl',
  'commit',
  'isCi',
  'pr',
  'prBranch',
  'service',
  'slug',
];

module.exports.debug = require('debug')('relative-ci:agent');

module.exports.getCommitMessage = () => childProcess
  .execSync('git log -1 --pretty=%B')
  .toString().trim();

module.exports.getEnvCI = () => pick(envCI(), CI_ENV_VAR_NAMES);
