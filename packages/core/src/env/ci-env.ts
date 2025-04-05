// env-ci and its dependencies are not flagged as external (not bundled)
// eslint-disable-next-line import/no-extraneous-dependencies
import envCi, { type CiEnv as BaseCiEnv } from 'env-ci';

import getEnv from '../process.env';
import { getSlugFromGitURL } from './git/slug';
import { getGitHubEnv } from './service/github';

type GetCiEnvConfig = {
  includeCommitMessage?: boolean;
}

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
export async function getCiEnv(config: GetCiEnvConfig): Promise<CiEnv> {
  const { includeCommitMessage = true } = config;

  const env = getEnv();

  // env-ci environment variables
  const baseCiEnv: BaseCiEnv = envCi();

  let ciEnv = {
    isCi: baseCiEnv.isCi,
    slug: 'slug' in baseCiEnv ? baseCiEnv.slug : undefined,
    service: 'service' in baseCiEnv ? baseCiEnv.service : undefined,
    /**
     * When running during a pull request, env-ci exposes the current branch as `prBranch`
     * and `branch` as base branch
     */
    // eslint-disable-next-line no-nested-ternary
    branch: 'prBranch' in baseCiEnv && baseCiEnv.prBranch ? baseCiEnv.prBranch : ('branch' in baseCiEnv ? baseCiEnv.branch : undefined),
    commit: 'commit' in baseCiEnv ? baseCiEnv.commit : undefined,
    pr: 'pr' in baseCiEnv ? baseCiEnv.pr : undefined,
    build: 'build' in baseCiEnv ? baseCiEnv.build : undefined,
    buildUrl: 'buildUrl' in baseCiEnv ? baseCiEnv.buildUrl : undefined,
  };

  // env-ci does not provide a slug for jenkins
  // https://github.com/semantic-release/env-ci/blob/master/services/jenkins.js#LL18
  // https://www.jenkins.io/doc/book/pipeline/jenkinsfile/#using-environment-variables
  // https://plugins.jenkins.io/git/#plugin-content-environment-variables
  if (ciEnv.service === 'jenkins' && !ciEnv.slug) {
    ciEnv.slug = getSlugFromGitURL(env.JENKINS_GIT_URL);
  }

  // GitHub extra data
  if (env.GITHUB_EVENT_PATH) {
    const gitHubEnv = await getGitHubEnv(env.GITHUB_EVENT_PATH, {
      includeCommitMessage,
      githubToken: env.GITHUB_TOKEN,
    });
    ciEnv = { ...ciEnv, ...gitHubEnv };
  }

  return ciEnv;
}

export function isCi() {
  const baseCiEnv = envCi();
  return baseCiEnv.isCi;
}
