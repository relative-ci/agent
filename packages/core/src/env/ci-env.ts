// env-ci and its dependencies are not flagged as external (not bundled)
// eslint-disable-next-line import/no-extraneous-dependencies
import envCi, { type CiEnv as BaseCiEnv } from 'env-ci';

import { getSlugFromGitURL } from './git/slug';
import { getGitHubEnv } from './service/github';

export type CiEnv = {
  isCi: boolean;
  slug?: string;
  service?: string;
  branch?: string;
  commit?: string;
  commitMessage?: string;
  pr?: string;
  build?: string;
  buildUrl?: string;
};

/**
 * Load environment variables - fallback to env-ci environment variables
 */
export function getCiEnv(): CiEnv {
  // CI environment variables
  const ciEnv: BaseCiEnv = envCi();

  let env = {
    isCi: ciEnv.isCi,
    slug: 'slug' in ciEnv ? ciEnv.slug : undefined,
    service: 'service' in ciEnv ? ciEnv.service : undefined,
    /**
     * When running during pull_request, env-ci exposes the current branch as prBranch
     */
    // eslint-disable-next-line no-nested-ternary
    branch: 'prBranch' in ciEnv ? ciEnv.prBranch : ('branch' in ciEnv ? ciEnv.branch : undefined),
    commit: 'commit' in ciEnv ? ciEnv.commit : undefined,
    pr: 'pr' in ciEnv ? ciEnv.pr : undefined,
    build: 'build' in ciEnv ? ciEnv.build : undefined,
    buildUrl: 'buildUrl' in ciEnv ? ciEnv.buildUrl : undefined,
  };

  // env-ci does not provide a slug for jenkins
  // https://github.com/semantic-release/env-ci/blob/master/services/jenkins.js#LL18
  // https://www.jenkins.io/doc/book/pipeline/jenkinsfile/#using-environment-variables
  // https://plugins.jenkins.io/git/#plugin-content-environment-variables
  if (env.service === 'jenkins' && !env.slug) {
    env.slug = getSlugFromGitURL(process.env.GIT_URL);
  }

  // Service data
  if (process.env.GITHUB_EVENT_PATH) {
    const gitHubEnv = getGitHubEnv(process.env.GITHUB_EVENT_PATH);
    env = { ...env, ...gitHubEnv };
  }

  return ciEnv;
}
