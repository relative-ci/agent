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
module.exports.extractRepoSlug = (repoURL) => {
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

module.exports.getGitSlug = () => {
  let repoURL = '';

  try {
    repoURL = childProcess
      .execSync('git config --get remote.config.url')
      .toString()
      .trim();
  } catch (err) {
    console.warn(err.message);
    return '';
  }

  return module.exports.extractRepoSlug(repoURL);
};

module.exports.getEnvCI = () => pick(envCI(), CI_ENV_VAR_NAMES);
