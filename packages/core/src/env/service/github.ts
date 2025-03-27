import fs from 'fs-extra';
import type { PushEvent, PullRequestEvent, WorkflowRunEvent } from '@octokit/webhooks-types';

function formatBranch(branchName?: string, baseOrg?: string, headOrg?: string): string | undefined {
  if (!branchName) {
    return undefined;
  }

  if (!headOrg || !baseOrg) {
    return branchName;
  }

  if (headOrg === baseOrg) {
    return branchName;
  }

  return `${headOrg}:${branchName}`;
}

type GitHubEventData = PushEvent | PullRequestEvent | WorkflowRunEvent;

type GetGitHubEnvConfig = {
  includeCommitMessage: boolean;
}

export type GitHubEnvPush = {
  commitMessage?: string;
}

export type GitHubEnvPullRequest = {
  commit?: string;
  branch?: string;
  pr?: string;
}

export type GitHubEnvWorflowRun = {
  commit?: string;
  branch?: string;
  pr?: string;
  commitMessage?: string;
}

export type GitHubEnv = GitHubEnvPush | GitHubEnvPullRequest | GitHubEnvWorflowRun;

export function getGitHubEnv(
  eventFilepath: string,
  config: GetGitHubEnvConfig,
): GitHubEnv | undefined {
  const { includeCommitMessage } = config;

  let payload: GitHubEventData;

  try {
    payload = fs.readJSONSync(eventFilepath) as GitHubEventData;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Error reading GitHub data from ${eventFilepath}`, error.message);
  }

  const baseOrg = payload.repository.owner.login;

  // pull request
  if ('pull_request' in payload) {
    const headOrg = payload.pull_request.head?.repo?.owner?.login;

    return {
      commit: payload.pull_request.head?.sha,
      branch: formatBranch(payload.pull_request.head?.ref, baseOrg, headOrg),
      pr: payload.pull_request.number?.toString(),
    } satisfies GitHubEnvPullRequest;
  }

  // workflow_run
  if ('workflow_run' in payload) {
    const headOrg = payload.workflow_run.head_repository?.owner?.login;

    const env: GitHubEnvWorflowRun = {
      commit: payload.workflow_run.head_commit?.id,
      branch: formatBranch(payload.workflow_run.head_branch, baseOrg, headOrg),
    };

    if ('event' in payload && payload.event === 'pull_request') {
      env.pr = payload.workflow_run?.pull_requests?.[0]?.number?.toString();
    }

    if (includeCommitMessage) {
      env.commitMessage = payload.workflow_run.head_commit?.message;
    }

    return env;
  }

  // push
  if ('head_commit' in payload && includeCommitMessage) {
    return {
      commitMessage: payload.head_commit.message,
    } satisfies GitHubEnvPush;
  }

  return undefined;
}
