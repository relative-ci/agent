/**
 * @typedef {import('../').EnvVars} EnvVars
 */
import childProcess from 'child_process';
import envCI from 'env-ci';
import getDebug from 'debug';
import get from 'lodash/get';
import set from 'lodash/set';
import merge from 'lodash/merge';

const DEFAULT_ENDPOINT = 'https://api.relative-ci.com/save';
const DEBUG_NAME = 'relative-ci:agent';
const MASK = '******';

export const debug = getDebug(DEBUG_NAME);

/**
 * @param {string|number} token
 * @returns {string}
 */
export function maskToken(token) {
  const text = token.toString();
  return `${MASK}${text.substring(text.length - 6)}`;
}

/**
 * @param {object} data
 * @param {Array<string>} propertyPaths
 */
export function maskObjectProperties(data, propertyPaths) {
  const normalizedData = merge({}, data);

  propertyPaths.forEach((propertyPath) => {
    const value = get(normalizedData, propertyPath, '');
    set(normalizedData, propertyPath, maskToken(value));
  });

  return normalizedData;
}

export function getCommitMessage() {
  let message = '';

  try {
    message = childProcess.execSync('git log -1 --pretty=%B').toString().trim();
  } catch (err) {
    console.error('Error reading the commit message from git');
  }

  return message;
}

// Match slug on SSH URLs (ex: `USER@HOST:PORT/ORG/REPO.git`)
const GIT_SSH_URL_SLUG_PATTERN = /^(?:.*)@(?:.*):(?:\d+\/)?(.*)\.git$/;

// Match slug on HTTP(S) URLs `https://github.com/relative-ci/agent.git`
const GIT_PATHNAME_SLUG_PATTERN = /^\/(.*)\.git$/;

/**
 * Extract repository slug(owner/repo) from the repo URL
 *
 * @param {string} repositoryURL
 * @returns {string|undefined}
 */
export function getSlugFromGitURL(repositoryURL) {
  if (!repositoryURL) {
    return undefined;
  }

  if (repositoryURL.match(GIT_SSH_URL_SLUG_PATTERN)) {
    return repositoryURL.replace(GIT_SSH_URL_SLUG_PATTERN, '$1');
  }

  try {
    const url = new URL(repositoryURL);
    return url.pathname.replace(GIT_PATHNAME_SLUG_PATTERN, '$1');
  } catch (err) {
    console.warn(err.message); // eslint-disable-line no-console
    return undefined;
  }
}

/**
 * Resolve repository slug
 * @param {import('env-ci').CiEnv} envVars
 * @returns {string}
 */
function resolveSlug(envVars) {
  // env-ci does not provide a slug for jenkins
  // https://github.com/semantic-release/env-ci/blob/master/services/jenkins.js#LL18
  // https://www.jenkins.io/doc/book/pipeline/jenkinsfile/#using-environment-variables
  // https://plugins.jenkins.io/git/#plugin-content-environment-variables
  if ('service' in envVars && envVars.service === 'jenkins') {
    return getSlugFromGitURL(process.env.GIT_URL);
  }

  // env-ci does not read repository slug, but buildkite org/project
  // https://buildkite.com/docs/pipelines/environment-variables#BUILDKITE_REPO
  if ('service' in envVars && envVars.service === 'buildkite') {
    return getSlugFromGitURL(process.env.BUILDKITE_REPO);
  }

  return 'slug' in envVars ? envVars.slug : '';
}

/**
 * @param {import('env-ci').CiEnv} data
 * @param {string} key
 * @returns {string | undefined}
 */
function getEnvCIVar(data, key) {
  if (!data[key]) {
    return undefined;
  }

  return data[key];
}

/**
 * Extract CI environment variables using env-ci and custom fallback env vars
 * @returns {EnvVars}
 */
export function getEnvVars() {
  // Get env-ci environment variables
  const envCIvars = envCI();
  debug('env-ci environment variables', envCIvars);

  // Get custom environment variables
  const customEnvVars = {
    key: process.env.RELATIVE_CI_KEY,
    endpoint: process.env.RELATIVE_CI_ENDPOINT || DEFAULT_ENDPOINT,
    service: process.env.RELATIVE_CI_SERVICE,
    slug: process.env.RELATIVE_CI_SLUG,
    branch: process.env.RELATIVE_CI_BRANCH,
    pr: process.env.RELATIVE_CI_PR,
    build: process.env.RELATIVE_CI_BUILD,
    buildUrl: process.env.RELATIVE_CI_BUILD_URL,
    commit: process.env.RELATIVE_CI_COMMIT,
    commitMessage: process.env.RELATIVE_CI_COMMIT_MESSAGE,
  };
  debug('RELATIVE_CI environment variables', maskObjectProperties(customEnvVars, ['key']));

  const resolvedEnvVars = {
    key: customEnvVars.key,
    endpoint: customEnvVars.endpoint,
    isCi: envCIvars.isCi, // process.env.CI
    service: customEnvVars.service || getEnvCIVar(envCIvars, 'service'),
    slug: customEnvVars.slug || resolveSlug(envCIvars),
    branch: customEnvVars.branch || getEnvCIVar(envCIvars, 'prBranch') || getEnvCIVar(envCIvars, 'branch'),
    pr: customEnvVars.pr || getEnvCIVar(envCIvars, 'pr'),
    build: customEnvVars.build || getEnvCIVar(envCIvars, 'build'),
    buildUrl: customEnvVars.buildUrl || getEnvCIVar(envCIvars, 'buildUrl'),
    commit: customEnvVars.commit || envCIvars.commit,
    commitMessage: customEnvVars.commitMessage,
  };
  debug('resolved environment variables', maskObjectProperties(resolvedEnvVars, ['key']));

  return resolvedEnvVars;
}
