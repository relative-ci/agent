import * as LOCALES from '../locales/en';
import {
  DEFAULT_ENDPOINT,
  type IngestParams,
  type PluginArgs,
  type PluginConfig,
} from '../constants';
import { debug } from '../utils/debug';
import { maskObjectProperties } from '../utils/mask-object-property';
import { getGitCommitMessage } from './git/commit-message';
import { getAgentEnv } from './agent-env';
import { getCiEnv } from './ci-env';

/**
 * Load and normalize ingest params based on:
 * 1. plugin arguments
 * 2. agent env vars (RELATIVE_CI_*)
 * 3. env-ci fallback
 * 4. computed values
 */
export function loadEnv(args: PluginArgs, config: PluginConfig): IngestParams {
  const ciEnvVars = getCiEnv();
  debug('CI environment variables', ciEnvVars);

  const agentEnvVars = getAgentEnv();
  debug('RELATIVE_CI environment variables', maskObjectProperties(agentEnvVars, ['key']));

  const params = {
    isCi: ciEnvVars.isCi,
    agentVersion: AGENT_VERSION,

    key: agentEnvVars.key,
    endpoint: agentEnvVars.endpoint || DEFAULT_ENDPOINT,

    service: agentEnvVars.service || ciEnvVars.service,
    slug: args.slug || agentEnvVars.slug || ciEnvVars.slug,

    branch: args.branch || agentEnvVars.branch || ciEnvVars.prBranch || ciEnvVars.branch,
    pr: args.pr || agentEnvVars.pr || ciEnvVars.pr,
    commit: args.commit || agentEnvVars.commit || ciEnvVars.commit,
    build: agentEnvVars.build || ciEnvVars.build,
    buildUrl: agentEnvVars.buildUrl || ciEnvVars.buildUrl,

    commitMessage: args.commitMessage || agentEnvVars.commitMessage,
  };

  /**
   * Get commit message using git if includeCommitMessage is set and
   * the commitMessage plugin argument is missing
   */
  if (!params.commitMessage && config.includeCommitMessage) {
    params.commitMessage = getGitCommitMessage();
  }

  debug('Environment variables', maskObjectProperties(params, ['key']));

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
