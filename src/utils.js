/**
 * @typedef {import('../').EnvCI} EnvCI
 */
import childProcess from 'child_process';
import envCI from 'env-ci';
import getDebug from 'debug';

export const debug = getDebug('relative-ci:agent');

export function getCommitMessage() {
  return childProcess.execSync('git log -1 --pretty=%B').toString().trim();
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
 * Extract CI environment variables using env-ci
 */
export function getEnvCI() {
  // Get normalized CI env variables
  const envCIvars = envCI();

  /** @type {EnvCI} */
  const envVars = {
    isCi: envCIvars.isCi, // process.env.CI
    service: 'service' in envCIvars ? envCIvars.service : process.env.RELATIV_CI_SERVICE,
    slug: 'slug' in envCIvars ? envCIvars.slug : process.env.RELATIVE_CI_SLUG,
    branch: ('prBranch' in envCIvars) ? envCIvars.prBranch : '' || envCIvars.branch || process.env.RELATIVE_CI_PR,
    pr: 'pr' in envCIvars ? envCIvars.pr : process.env.RELATIVE_CI_PR,
    build: 'build' in envCIvars ? envCIvars.build : process.env.RELATIVE_CI_BUILD,
    buildUrl: 'buildUrl' in envCIvars ? envCIvars.buildUrl : process.env.RELATIVE_CI_BUILD_URL,
    commit: envCIvars.commit || process.env.RELATIVE_CI_COMMIT,
    commitMessage: process.env.RELATIVE_CI_COMMIT_MESSAGE,
  };

  // env-ci does not provide a slug for jenkins
  // https://github.com/semantic-release/env-ci/blob/master/services/jenkins.js#LL18
  // https://www.jenkins.io/doc/book/pipeline/jenkinsfile/#using-environment-variables
  // https://plugins.jenkins.io/git/#plugin-content-environment-variables
  if (envVars.service === 'jenkins' && !envVars.slug) {
    envVars.slug = extractRepoSlug(process.env.GIT_URL);
  }

  return envVars;
}
