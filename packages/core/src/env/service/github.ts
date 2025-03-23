import fs from 'fs-extra';
import type { PushEvent, PullRequestEvent, WorkflowRunEvent } from '@octokit/webhooks-types';

type GitHubEventData = PushEvent | PullRequestEvent | WorkflowRunEvent;

type GetGitHubEnvConfig = {
  includeCommitMessage: boolean;
}

export type GitHubEnv = {
  branch?: string;
  commit?: string;
  commitMessage?: string;
};

export function getGitHubEnv(eventFilepath: string, config: GetGitHubEnvConfig): GitHubEnv {
  const { includeCommitMessage } = config;

  const env: GitHubEnv = {};

  let payload: GitHubEventData;

  try {
    payload = fs.readJSONSync(eventFilepath) as GitHubEventData;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Error reading GitHub data from ${eventFilepath}`, error.message);
  }

  // push
  if ('head_commit' in payload) {
    env.commit = payload.head_commit.id;

    if (includeCommitMessage) {
      env.commitMessage = payload.head_commit.message;
    }
  }

  // pull request
  if ('pull_request' in payload) {
    env.commit = payload.pull_request.head?.sha;
    env.branch = payload.pull_request.head?.ref;
  }

  // workflow_run
  if ('workflow_run' in payload) {
    env.commit = payload.workflow_run.head_commit?.id;
    env.branch = payload.workflow_run.head_branch;

    if (includeCommitMessage) {
      env.commitMessage = payload.workflow_run.head_commit?.message;
    }
  }

  return env;
}
