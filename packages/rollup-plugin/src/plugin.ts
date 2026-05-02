import _ from 'lodash';
import { type OutputBundle } from 'rollup-plugin-stats';
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

const PLUGIN_NAME = 'RelativeCiAgent';

/**
 * Subset of the Vite/Rolldown/Rollup plugin hook context (`this`) used by this plugin.
 */
type PluginContext = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
};

/**
 * Minimum plugin interface compatible with Vite/Rolldown/Rollup.
 *
 * @example
 * {
 *   name: 'rollupStats',
 *   async generateBundle(outputOptions, bundle) { ... },
 * }
 */
export type Plugin = {
  /** Unique identifier for the plugin, used in error messages and logs. */
  name: string;

  /**
   * Hook called after the bundle has been fully generated but before it is
   * written to disk. Receives the resolved output options and the complete
   * output bundle map.
   */
  generateBundle?: (
    this: PluginContext,
    outputOptions: unknown,
    bundle: OutputBundle,
    isWrite: boolean,
  ) => void | Promise<void>;
};

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
    const logger: Logger = {
      log: console.log, // eslint-disable-line no-console
      info: this.info,
      warn: this.warn,
      error: this.error,
      debug, // send debug messages to the inline utility for consistent debugging across plugins
    };

    const options = _.merge({}, DEFAULT_OPTIONS, userOptions) as RelativeCiAgentOptions;

    logger.debug(options);

    const {
      enabled,
      failOnError,
      includeCommitMessage,
      stats: statsOptions = {},
      ...agentOptions
    } = options;

    // Skip if not enabled
    if (!enabled) {
      logger.debug(`${PLUGIN_NAME} is disabled, skip sending data.`);
      return;
    }

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
      const error = pluginError instanceof Error ? pluginError.message : String(pluginError);

      // Propagate the error to the bundler if failOnError is enabled, otherwise log a warning and continue
      if (failOnError) {
        logger.error(error);
        return;
      }

      logger.warn(error);
    }
  },
});
