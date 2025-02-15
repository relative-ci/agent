import childProcess from 'child_process';
import envCI, { type CiEnv } from 'env-ci';
import getDebug from 'debug';
import get from 'lodash/get';
import set from 'lodash/set';
import merge from 'lodash/merge';

import { type EnvVars } from './constants';

const DEFAULT_ENDPOINT = 'https://api.relative-ci.com/save';
const DEBUG_NAME = 'relative-ci:agent';
const MASK = '******';

export const debug = getDebug(DEBUG_NAME);

export function maskToken(token: string | number): string {
  const text = token.toString();
  return `${MASK}${text.substring(text.length - 6)}`;
}

export function maskObjectProperties(data: unknown, propertyPaths: Array<string>): unknown {
  const normalizedData = merge({}, data);

  propertyPaths.forEach((propertyPath) => {
    const value = get(normalizedData, propertyPath, '');
    set(normalizedData, propertyPath, maskToken(value));
  });

  return normalizedData;
}

export function getCommitMessage(): string {
  let message = '';

  try {
    message = childProcess.execSync('git log -1 --pretty=%B').toString().trim();
  } catch (error) {
    console.error('Error reading commit message from git', error);
  }

  return message;
}

// Match slug on SSH URLs (ex: `USER@HOST:PORT/ORG/REPO.git`)
const GIT_SSH_URL_SLUG_PATTERN = /^(?:.*)@(?:.*):(?:\d+\/)?(.*)\.git$/;

// Match slug on HTTP(S) URLs `https://github.com/relative-ci/agent.git`
const GIT_PATHNAME_SLUG_PATTERN = /^\/(.*)\.git$/;

/**
 * Extract repository slug(owner/repo) from the repo URL
 */
export function getSlugFromGitURL(repositoryURL?: string): string | undefined {
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
    if (err instanceof Error) {
      console.warn(err.message);
    }
    return undefined;
  }
}

/**
 * Resolve repository slug
 */
function resolveSlug(envVars: CiEnv): string {
  // env-ci does not provide a slug for jenkins
  // https://github.com/semantic-release/env-ci/blob/master/services/jenkins.js#LL18
  // https://www.jenkins.io/doc/book/pipeline/jenkinsfile/#using-environment-variables
  // https://plugins.jenkins.io/git/#plugin-content-environment-variables
  if ('service' in envVars && envVars.service === 'jenkins') {
    return getSlugFromGitURL(process.env.GIT_URL || '') || '';
  }

  // env-ci does not read repository slug, but buildkite org/project
  // https://buildkite.com/docs/pipelines/environment-variables#BUILDKITE_REPO
  if ('service' in envVars && envVars.service === 'buildkite') {
    return getSlugFromGitURL(process.env.BUILDKITE_REPO || '') || '';
  }

  return 'slug' in envVars ? envVars.slug : '';
}

function getEnvCIVar(data: CiEnv, key: string): string | undefined {
  if (!data[key as keyof typeof data]) {
    return undefined;
  }

  return data[key as keyof typeof data] as string;
}

/**
 * Extract CI environment variables using env-ci and custom fallback env vars
 */
export function getEnvVars(): Partial<EnvVars> {
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
    isCi: envCIvars.isCi, // process.env.CI
    service: customEnvVars.service || getEnvCIVar(envCIvars, 'service'),
    slug: customEnvVars.slug || resolveSlug(envCIvars),
    branch: customEnvVars.branch || getEnvCIVar(envCIvars, 'prBranch') || getEnvCIVar(envCIvars, 'branch'),
    pr: customEnvVars.pr || getEnvCIVar(envCIvars, 'pr'),
    build: customEnvVars.build || getEnvCIVar(envCIvars, 'build'),
    buildUrl: customEnvVars.buildUrl || getEnvCIVar(envCIvars, 'buildUrl'),
    commit: customEnvVars.commit || envCIvars.commit,
    commitMessage: customEnvVars.commitMessage,
    key: customEnvVars.key,
    endpoint: customEnvVars.endpoint,
  };
  debug('resolved environment variables', maskObjectProperties(resolvedEnvVars, ['key']));

  return resolvedEnvVars;
}
