import * as LOCALES from '../locales/en';
import {
  DEFAULT_ENDPOINT,
  type IngestParams,
  type PluginArgs,
} from '../constants';
import { debug } from '../utils/debug';
import { logger as defaultLogger } from '../utils/logger';
import { maskObjectProperties } from '../utils/mask-object-property';
import { getGitCommitMessage } from './git/commit-message';
import { getAgentEnv } from './agent-env';
import { getCiEnv } from './ci-env';

export type LoadEnvConfig = {
  includeCommitMessage?: boolean;
}

/**
 * Load and normalize ingest params based on:
 * 1. plugin arguments
 * 2. agent env vars (RELATIVE_CI_*)
 * 3. env-ci fallback
 * 4. computed values
 */
export async function loadEnv(
  args: PluginArgs,
  config: LoadEnvConfig = {},
  logger = defaultLogger,
): Promise<IngestParams> {
  const { includeCommitMessage = true } = config;

  const ciEnv = await getCiEnv({ includeCommitMessage }, logger);
  debug('CI env', ciEnv);

  const agentEnv = getAgentEnv();
  debug('RELATIVE_CI env', maskObjectProperties(agentEnv, ['key']));

  const params = {
    isCi: ciEnv.isCi,
    agentVersion: AGENT_VERSION,
    agentType: args.agentType,

    key: agentEnv.key,
    endpoint: agentEnv.endpoint || DEFAULT_ENDPOINT,

    service: agentEnv.service || ciEnv.service,
    slug: args.slug || agentEnv.slug || ciEnv.slug,

    branch: args.branch || agentEnv.branch || ciEnv.branch,
    pr: args.pr || agentEnv.pr || ciEnv.pr,
    commit: args.commit || agentEnv.commit || ciEnv.commit,
    commitMessage: args.commitMessage || agentEnv.commitMessage || ciEnv.commitMessage,
    build: agentEnv.build || ciEnv.build,
    buildUrl: agentEnv.buildUrl || ciEnv.buildUrl,
  };

  /**
   * Get commit message using git if includeCommitMessage is set and
   * the commitMessage plugin argument is missing
   */
  if (!params.commitMessage && includeCommitMessage) {
    params.commitMessage = getGitCommitMessage();
  }

  debug('Env', maskObjectProperties(params, ['key']));

  // Validate required parameters
  if (!params.key) {
    throw new Error(LOCALES.AGENT_MISSING_KEY_ERROR);
  }

  if (!params.slug) {
    throw new Error(LOCALES.AGENT_MISSING_SLUG_ERROR);
  }

  if (!params.commit) {
    throw new Error(LOCALES.AGENT_MISSING_COMMIT_ERROR);
  }

  if (!params.branch) {
    throw new Error(LOCALES.AGENT_MISSING_BRANCH_ERROR);
  }

  // Explicitly pass required props to allow ts to infer correctly
  return {
    ...params,
    key: params.key,
    slug: params.slug,
    branch: params.branch,
    commit: params.commit,
  };
}
