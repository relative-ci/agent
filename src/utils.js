/**
 * @typedef {import('../').EnvCI} EnvCI
 */
const childProcess = require('child_process');
const { pick } = require('lodash');
const envCI = require('env-ci');

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

// Match slug on `git@github.com:relative-ci/agent.git`
const GIT_SSH_URL_SLUG_PATTERN = /^git@(?:.*):(.*)\.git$/;

// Match slug on `/relative-ci/agent.git`
const GIT_PATHNAME_SLUG_PATTERN = /^\/(.*)\.git$/;

/**
 * Extract repository slug(owner/repo) from the repo URL
 *
 * @param {string} repoURL
 * @returns {string}
 */
const extractRepoSlug = (repoURL) => {
  if (!repoURL) {
    return '';
  }

  if (repoURL.match(/^git@/)) {
    return repoURL.replace(GIT_SSH_URL_SLUG_PATTERN, '$1');
  }

  try {
    const url = new URL(repoURL);
    return url.pathname.replace(GIT_PATHNAME_SLUG_PATTERN, '$1');
  } catch (err) {
    console.warn(err.message);
    return '';
  }
};

module.exports.getEnvCI = () => {
  /** @type {EnvCI} */
  const envVars = pick(envCI(), CI_ENV_VAR_NAMES);

  // env-ci does not provide a slug for jenkins
  // https://github.com/semantic-release/env-ci/blob/master/services/jenkins.js#LL18
  // https://www.jenkins.io/doc/book/pipeline/jenkinsfile/#using-environment-variables
  // https://plugins.jenkins.io/git/#plugin-content-environment-variables
  if (envVars.service === 'jenkins' && !envVars.slug) {
    envVars.slug = extractRepoSlug(process.env.GIT_URL);
  }

  return envVars;
};

module.exports.extractRepoSlug = extractRepoSlug;
