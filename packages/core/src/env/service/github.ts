import fs from 'fs-extra';

type GitHubEventPush = {
  head_commit?: {
    id?: string;
    message?: string;
  }
}

type GitHubEventPullRequest = {
  pull_request?: {
    head? :{
      ref?: string;
      sha?: string;
    }
  }
}

type GitHubEventWorkflowRun = {
  workflow_run?: {
    head_commit?: {
      id?: string;
      message?: string;
    }
  }
}

type GitHubEvent = GitHubEventPush | GitHubEventPullRequest | GitHubEventWorkflowRun;

export type GitHubEnv = {
  commit?: string;
  commitMessage?: string;
};

export function getGitHubEnv(eventFilepath: string): GitHubEnv {
  const env: GitHubEnv = {};

  let payload: GitHubEvent;

  try {
    payload = fs.readJSONSync(eventFilepath);
  } catch (error) {
    console.warn('Error reading event JSON data!', error.messsage);
    return env;
  }

  // push
  if ('head_commit' in payload) {
    env.commit = payload.head_commit.id;
    env.commitMessage = payload.head_commit.message;
  }

  // pull request
  if ('pull_request' in payload) {
    env.commit = payload.pull_request.head?.sha;
  }

  // workflow_run
  if ('workflow_run' in payload) {
    env.commit = payload.workflow_run.head_commit?.id;
    env.commitMessage = payload.workflow_run.head_commit?.message;
  }

  return env;
}
