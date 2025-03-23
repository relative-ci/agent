import fs from 'fs-extra';

export type GitHubEnv = {
  commit?: string;
  commitMessage?: string;
};

export function getGitHubEnv(eventFilepath: string): GitHubEnv {
  const env: GitHubEnv = {};

  const payload = fs.readJSONSync(eventFilepath);

  console.log(eventFilepath, payload);

  // push
  if (payload.head_commit) {
    env.commit = payload.head_commit.id;
    env.commitMessage = payload.head_commit.messsage;
  }

  // pull request
  if (payload.pull_request) {
    env.commit = payload.pull_request.head?.sha;
  }

  // workflow_run
  if (payload.workflow_run) {
    env.commit = payload.workflow_run.head_commit?.id;
    env.commitMessage = payload.workflow_run.head_commit?.message;
  }

  return {};
}
