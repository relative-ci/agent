import fs from 'fs-extra';
import * as github from '@actions/github';
import type { PushEvent, PullRequestEvent, WorkflowRunEvent } from '@octokit/webhooks-types';

import getEnv from '../../process.env';
import { getGitCommitMessage } from '../git/commit-message';
import { debug } from '../../utils/debug';
import { type Logger } from '../../utils/logger';

type GitHubCommitMessageOptions = {
  owner: string;
  repo: string;
  commit: string;
  token: string;
};

async function getGitHubCommitMessage(
  options: GitHubCommitMessageOptions,
  logger: Logger,
): Promise<string | undefined> {
  const {
    owner,
    repo,
    commit,
    token,
  } = options;

  let message;

  const octokit = github.getOctokit(token);
  debug(`Fetching commit message for ${commit}`);

  try {
    const res = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: commit,
    });

    message = res?.data?.commit?.message;
  } catch (err) {
    debug(`Error fetching commit message: ${err.message}`);
    logger.warn(err);
  }

  return message;
}

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
  commitMessage?: string;
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

export async function getGitHubEnv(
  eventFilepath: string,
  config: GetGitHubEnvConfig,
  logger: Logger,
): Promise<GitHubEnv | undefined> {
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

    /**
     * When running durring the pull_request event, the current commit is the GitHub merge commit
     * By default, we set an empty commit message to override the default merge commit message
     * (ex: "Merge SHA to SHA")
     */
    const env: GitHubEnvPullRequest = {
      commit: payload.pull_request.head?.sha,
      commitMessage: '',
      branch: formatBranch(payload.pull_request.head?.ref, baseOrg, headOrg),
      pr: payload.pull_request.number?.toString(),
    };

    if (includeCommitMessage) {
      // Extract from git if SHA is available and part of the local git history
      if (env.commit) {
        debug(`Extract commit message from git for commit ${env.commit}.`);
        env.commitMessage = getGitCommitMessage(env.commit);
      }

      // Extract from GitHub API if GITHUB_TOKEN is available
      const processEnv = getEnv();
      if (processEnv.GITHUB_TOKEN) {
        debug(`Extract commit message from GitHub API for commit ${env.commit}.`);
        const { name: repo, owner } = payload.pull_request.head.repo;

        env.commitMessage = await getGitHubCommitMessage({
          owner: owner.login,
          repo,
          commit: env.commit,
          token: processEnv.GITHUB_TOKEN,
        }, logger);
      } else {
        debug(`GITHUB_TOKEN is missing! Skip extracting commit message from GitHub API for commit ${env.commit}.`);
      }

      // Fallback to current git commit message
      if (!env.commitMessage) {
        env.commitMessage = getGitCommitMessage();
      }
    }

    return env;
  }

  // workflow_run
  if ('workflow_run' in payload) {
    const headOrg = payload.workflow_run.head_repository?.owner?.login;

    const env: GitHubEnvWorflowRun = {
      commit: payload.workflow_run.head_commit?.id,
      branch: formatBranch(payload.workflow_run.head_branch, baseOrg, headOrg),
    };

    if (includeCommitMessage) {
      env.commitMessage = payload.workflow_run.head_commit?.message;
    }

    if ('event' in payload && payload.event === 'pull_request') {
      env.pr = payload.workflow_run?.pull_requests?.[0]?.number?.toString();
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
