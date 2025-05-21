import getEnv from '../process.env';

export type AgentEnv = {
  key?: string;
  endpoint?: string;

  slug?: string;
  service?: string;

  branch?: string;
  commit?: string;
  pr?: string;
  build?: string;
  buildUrl?: string;
  commitMessage?: string;
};

/**
 * Load agent environment variables
 */
export function getAgentEnv(): AgentEnv {
  const env = getEnv();

  // RelativeCI environment variables
  return {
    key: env.RELATIVE_CI_KEY,
    endpoint: env.RELATIVE_CI_ENDPOINT,

    service: env.RELATIVE_CI_SERVICE,
    slug: env.RELATIVE_CI_SLUG,

    branch: env.RELATIVE_CI_BRANCH,
    pr: env.RELATIVE_CI_PR,
    build: env.RELATIVE_CI_BUILD,
    buildUrl: env.RELATIVE_CI_BUILD_URL,
    commit: env.RELATIVE_CI_COMMIT,
    commitMessage: env.RELATIVE_CI_COMMIT_MESSAGE,
  };
}
