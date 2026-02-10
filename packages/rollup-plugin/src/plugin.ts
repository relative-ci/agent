import _ from 'lodash';
// eslint-disable-next-line import/no-unresolved
import extractStats, { type StatsOptions } from 'rollup-plugin-stats/extract';
// eslint-disable-next-line import/no-unresolved
import { bundleToWebpackStats } from 'rollup-plugin-webpack-stats/transform';
import type { BundleTransformOptions } from 'rollup-plugin-webpack-stats/transform';

import {
  type Logger,
  type PluginConfig,
  SOURCE_WEBPACK_STATS,
  debug,
  filterArtifacts,
  logResponse,
  validateWebpackStats,
} from '@relative-ci/core';
import loadEnv, { isCi } from '@relative-ci/core/env';
import ingest from '@relative-ci/core/ingest';
import type { Plugin } from './types';

const PLUGIN_NAME = 'RelativeCiAgent';

type RelativeCiAgentOptions = {
  /**
   * Plugin is enabled - sends data to RelativeCI
   * @default env-ci isCi value
   */
  enabled?: boolean;
  /**
   * Throw error when validation or ingestion fails
   * @default {false}
   */
  failOnError?: boolean;
  /**
   * Rollup/Vite/Rolldown stats options
   * @default assets, chunks, modules
   */
  stats?: Omit<StatsOptions, 'source'> & BundleTransformOptions;
} & PluginConfig;

const DEFAULT_OPTIONS = {
  enabled: isCi(),
  failOnError: false,
  includeCommitMessage: true,
  payloadFilepath: undefined,
  compress: false,
  stats: {
    assets: true,
    chunks: true,
    modules: true,
  },
};

export const relativeCiAgent = (userOptions: RelativeCiAgentOptions = {}): Plugin => ({
  name: PLUGIN_NAME,
  async generateBundle(__, bundle) {
    const options = _.merge({}, DEFAULT_OPTIONS, userOptions) as RelativeCiAgentOptions;

    debug(options);

    const {
      enabled,
      failOnError,
      includeCommitMessage,
      stats: statsOptions,
      ...agentOptions
    } = options;

    // Skip if not enabled
    if (!enabled) {
      debug(`${PLUGIN_NAME} is disabled, skip sending data`);
      return;
    }

    const logger: Logger = {
      log: console.log, // eslint-disable-line no-console
      info: this.info,
      warn: this.warn,
      error: this.error,
      debug: this.debug,
    };

    // 1. Extract bundle stats from rollup/vite/rolldown
    const { moduleOriginalSize, transform, ...extractStatsOptions } = statsOptions;

    const bundleStats = extractStats(bundle, {
      source: true, // extract stats source to calculate module size
      ...extractStatsOptions,
    });

    // 2. Transform bundle stats to supported format
    const bundleWebpackStats = bundleToWebpackStats(bundleStats, { moduleOriginalSize, transform });

    // 3. Ingest data
    // catch error to prevent process failure on error
    try {
      validateWebpackStats(bundleWebpackStats);

      const envParams = await loadEnv(
        { agentType: 'rollup-plugin' },
        { includeCommitMessage },
        logger,
      );
      const artifactsData = filterArtifacts([
        { key: SOURCE_WEBPACK_STATS, data: bundleWebpackStats },
      ]);
      const response = await ingest(artifactsData, envParams, agentOptions, logger);

      logResponse(response);
    } catch (pluginError: unknown) {
      const error = pluginError instanceof Error ? pluginError : String(pluginError);

      if (failOnError) {
        this.error(error);
        return;
      }

      this.warn(error);
    }
  },
});
