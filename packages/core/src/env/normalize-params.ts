import * as LOCALES from '../locales/en';
import {
  DEFAULT_ENDPOINT,
  type IngestParams,
  type PluginArgs,
  type PluginConfig,
} from '../constants';
import { debug } from '../utils/debug';
import { maskObjectProperties } from '../utils/mask-object-property';
import { getCommitMessage } from './git/commit-message';
import { getEnvVars } from './get-env-vars';

/**
 * Normalize ingest params based on:
 * 1. plugin arguments
 * 2. computed values
 * 3. env-ci fallback
 */
export function normalizeParams(pluginArgs: PluginArgs, config: PluginConfig): IngestParams {
  const envVars = getEnvVars();

  const params = {
    slug: pluginArgs.slug || envVars.slug,
    branch: pluginArgs.branch || envVars.branch,
    pr: pluginArgs.pr || envVars.pr,
    commit: pluginArgs.commit || envVars.commit,

    build: envVars.build,
    buildUrl: envVars.buildUrl,
    service: envVars.service,

    key: envVars.key,
    endpoint: envVars.endpoint || DEFAULT_ENDPOINT,
    agentVersion: AGENT_VERSION,

    /**
     * Get commit message using git if includeCommitMessage is set and
     * the commitMessage plugin argument is missing
     */
    commitMessage: pluginArgs.commitMessage
      || envVars.commitMessage
      || (config.includeCommitMessage ? getCommitMessage() : undefined),
  };

  debug('normalized parameters', maskObjectProperties(params, ['key']));

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
