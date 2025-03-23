import { getGitHubEnv, type GitHubEnv } from './service/github';

export type ServiceEnv = GitHubEnv;

export function getServiceEnv(): ServiceEnv {
  let env = {};

  if (process.env.GITHUB_EVENT_PATH) {
    env = {
      ...getGitHubEnv(process.env.GITHUB_EVENT_PATH),
    };
  }

  return env;
}
