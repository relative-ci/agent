import fs from 'fs-extra';

export type GitHubEnv = {
  commit?: string;
  commitMessage?: string;
};

export function getGitHubEnv(eventFilepath: string): GitHubEnv {
  const env: GitHubEnv = {};

  const payload = fs.readJSONSync(eventFilepath);

  // push
  const { head_commit: headCommit } = payload;

  if (headCommit) {
    env.commit = headCommit.id;
    env.commitMessage = headCommit.messsage;
  }

  // pull request
  const { pull_request: pullRequest } = payload;
  if (pullRequest) {
    env.commit = pullRequest.head?.sha;
  }

  // workflow_run
  if (payload.workflow_run) {
    env.commit = payload.workflow_run.head_commit?.id;
    env.commitMessage = payload.workflow_run.head_commit?.message;
  }

  return {};
}
