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
  // RelativeCI environment variables
  return {
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
}
