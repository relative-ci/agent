// env-ci and its dependencies are not flagged as external (not bundled)
// eslint-disable-next-line import/no-extraneous-dependencies
import envCi, { type CiEnv } from 'env-ci';

import { type EnvVars } from '../constants';
import { debug } from './debug';
import { maskObjectProperties } from './mask-object-property';
import { getSlug } from './get-slug';

function getEnvVarValue(envVars: CiEnv, envVarName: string): string | undefined {
  const name = envVarName as keyof typeof envVars;

  if (!envVars[name]) {
    return undefined;
  }

  return envVars[name] as string;
}

/**
 * Load environment variables - fallback to env-ci environment variables
 */
export function getEnvVars(): Partial<EnvVars> {
  // CI environment variables
  const ciEnvVars = envCi();
  debug('CI environment variables', ciEnvVars);

  // RelativeCI environment variables
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
    isCi: ciEnvVars.isCi,
    key: customEnvVars.key,
    endpoint: customEnvVars.endpoint,
    service: customEnvVars.service || getEnvVarValue(ciEnvVars, 'service'),
    slug: customEnvVars.slug || getSlug(ciEnvVars),
    branch: customEnvVars.branch || getEnvVarValue(ciEnvVars, 'prBranch') || getEnvVarValue(ciEnvVars, 'branch'),
    pr: customEnvVars.pr || getEnvVarValue(ciEnvVars, 'pr'),
    build: customEnvVars.build || getEnvVarValue(ciEnvVars, 'build'),
    buildUrl: customEnvVars.buildUrl || getEnvVarValue(ciEnvVars, 'buildUrl'),
    commit: customEnvVars.commit || ciEnvVars.commit,
    commitMessage: customEnvVars.commitMessage,
  };
  debug('Environment variables', maskObjectProperties(resolvedEnvVars, ['key']));

  return resolvedEnvVars;
}
