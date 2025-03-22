// env-ci and its dependencies are not flagged as external (not bundled)
// eslint-disable-next-line import/no-extraneous-dependencies
import envCi, { JenkinsEnv, type CiEnv as BaseCiEnv } from 'env-ci';

import { getSlugFromGitURL } from './git/slug';

export type CiEnv = {
  isCi: boolean;
  slug?: string;
  service?: string;
  branch?: string;
  prBranch?: string;
  commit?: string;
  pr?: string;
  build?: string;
  buildUrl?: string;
};

type JenkinsEnvWithSlug = JenkinsEnv & { slug: string };

/**
 * Load environment variables - fallback to env-ci environment variables
 */
export function getCiEnv(): CiEnv {
  // CI environment variables
  const ciEnvVars: BaseCiEnv | JenkinsEnvWithSlug = envCi();

  // env-ci does not provide a slug for jenkins
  // https://github.com/semantic-release/env-ci/blob/master/services/jenkins.js#LL18
  // https://www.jenkins.io/doc/book/pipeline/jenkinsfile/#using-environment-variables
  // https://plugins.jenkins.io/git/#plugin-content-environment-variables
  if ('service' in ciEnvVars && ciEnvVars.service === 'jenkins') {
    (ciEnvVars as JenkinsEnvWithSlug).slug = getSlugFromGitURL(process.env.GIT_URL);
  }

  return ciEnvVars;
}
