import { getGitHubEnv, type GitHubEnv } from './service/github';

export type ServiceEnv = GitHubEnv;

export function getServiceEnv(): ServiceEnv {
  let env = {};

  if (process.env.GITHUB_EVENT_PATH) {
    try {
      const gitHubEnv = getGitHubEnv(process.env.GITHUB_EVENT_PATH);
      env = { ...env, ...gitHubEnv };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Error reading GitHub data from ${process.env.GITHUB_EVENT_PATH}`, error.message);
    }
  }

  return env;
}
