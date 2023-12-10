/**
 * @typedef {import('../').EnvCI} EnvCI
 */
import childProcess from 'child_process';
import envCI from 'env-ci';
import getDebug from 'debug';

const DEFAULT_ENDPOINT = 'https://api.relative-ci.com/save';

export const debug = getDebug('relative-ci:agent');

export function getCommitMessage() {
  let message = '';

  try {
    message = childProcess.execSync('git log -1 --pretty=%B').toString().trim();
  } catch (err) {
    console.error('Error reading the commit message from git');
  }

  return message;
}

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
export function extractRepoSlug(repoURL) {
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
}

/**
 * Resolve repository slug
 * @param {import('env-ci').CiEnv} envVars
 * @returns {string}
 */
function resolveSlug(envVars) {
  // Use custom slug environment variable if available
  if (process.env.RELATIVE_CI_SLUG) {
    return process.env.RELATIVE_CI_SLUG;
  }

  // env-ci does not provide a slug for jenkins
  // https://github.com/semantic-release/env-ci/blob/master/services/jenkins.js#LL18
  // https://www.jenkins.io/doc/book/pipeline/jenkinsfile/#using-environment-variables
  // https://plugins.jenkins.io/git/#plugin-content-environment-variables
  if ('service' in envVars && envVars.service === 'jenkins') {
    return extractRepoSlug(process.env.GIT_URL);
  }

  // env-ci does not read repository slug, but buildkite org/project
  // https://buildkite.com/docs/pipelines/environment-variables#BUILDKITE_REPO
  if ('service' in envVars && envVars.service === 'buildkite') {
    return extractRepoSlug(process.env.BUILDKITE_REPO);
  }

  return 'slug' in envVars ? envVars.slug : '';
}

/**
 * Extract CI environment variables using env-ci and custom fallback env vars
 * @returns {EnvCI}
 */
export function getEnvVars() {
  // Get normalized CI env variables
  const envCIvars = envCI();

  debug('env-ci environment variables', envCIvars);

  const envVars = {
    isCi: envCIvars.isCi, // process.env.CI
    service: ('service' in envCIvars && envCIvars.service) || process.env.RELATIVE_CI_SERVICE,
    slug: resolveSlug(envCIvars),
    branch: ('prBranch' in envCIvars && envCIvars.prBranch) || ('branch' in envCIvars && envCIvars.branch) || process.env.RELATIVE_CI_BRANCH,
    pr: ('pr' in envCIvars && envCIvars.pr) || process.env.RELATIVE_CI_PR,
    build: ('build' in envCIvars && envCIvars.build) || process.env.RELATIVE_CI_BUILD,
    buildUrl: ('buildUrl' in envCIvars && envCIvars.buildUrl) || process.env.RELATIVE_CI_BUILD_URL,
    commit: envCIvars.commit || process.env.RELATIVE_CI_COMMIT,
    commitMessage: process.env.RELATIVE_CI_COMMIT_MESSAGE,

    key: process.env.RELATIVE_CI_KEY,
    endpoint: process.env.RELATIVE_CI_ENDPOINT || DEFAULT_ENDPOINT,
  };

  debug('environment variables', envCIvars);

  return envVars;
}
