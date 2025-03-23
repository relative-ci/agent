import fs from 'fs-extra';
import type { PushEvent, PullRequestEvent, WorkflowRunEvent } from '@octokit/webhooks-types';

type GitHubEventData = PushEvent | PullRequestEvent | WorkflowRunEvent;

export type GitHubEnv = {
  commit?: string;
  commitMessage?: string;
};

export function getGitHubEnv(eventFilepath: string): GitHubEnv {
  const env: GitHubEnv = {};

  const payload = fs.readJSONSync(eventFilepath) as GitHubEventData;

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
