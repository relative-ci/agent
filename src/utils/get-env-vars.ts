import envCI, { type CiEnv } from 'env-ci';

import { type EnvVars } from '../constants';
import { debug } from './debug';
import { maskObjectProperties } from './mask-object-property';
import { getSlug } from './get-slug';

function getEnvVarValue(data: CiEnv, key: string): string | undefined {
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
    endpoint: process.env.RELATIVE_CI_ENDPOINT,
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
    service: customEnvVars.service || getEnvVarValue(envCIvars, 'service'),
    slug: customEnvVars.slug || getSlug(envCIvars),
    branch: customEnvVars.branch || getEnvVarValue(envCIvars, 'prBranch') || getEnvVarValue(envCIvars, 'branch'),
    pr: customEnvVars.pr || getEnvVarValue(envCIvars, 'pr'),
    build: customEnvVars.build || getEnvVarValue(envCIvars, 'build'),
    buildUrl: customEnvVars.buildUrl || getEnvVarValue(envCIvars, 'buildUrl'),
    commit: customEnvVars.commit || envCIvars.commit,
    commitMessage: customEnvVars.commitMessage,
    key: customEnvVars.key,
  };
  debug('resolved environment variables', maskObjectProperties(resolvedEnvVars, ['key']));

  return resolvedEnvVars;
}
