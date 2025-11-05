import webpack, {
  Compilation, type Compiler, type Configuration,
} from 'webpack';
import _ from 'lodash';
import {
  SOURCE_WEBPACK_STATS,
  debug,
  filterArtifacts,
  validateWebpackStats,
  logResponse,
  type PluginConfig,
} from '@relative-ci/core';
// eslint-disable-next-line import/no-unresolved
import loadEnv, { isCi } from '@relative-ci/core/env';
// eslint-disable-next-line import/no-unresolved
import ingest from '@relative-ci/core/ingest';

type RelativeCIAgentWebpackPluginOptions = {
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
   * Read commit message from git
   * @default true
   */
  includeCommitMessage?: PluginConfig['includeCommitMessage'];
  /**
   * Output payload on a local file for debugging
   */
  payloadFilepath?: PluginConfig['payloadFilepath'];
  /**
   * Compress ingest data
   */
  compress?: PluginConfig['compress'];
  /**
   * Webpack stats options
   * @default assets, chunks, modules
   */
  stats?: Configuration['stats'];
}

const PLUGIN_NAME = 'RelativeCiAgent';

const DEFAULT_OPTIONS = {
  includeCommitMessage: true,
  payloadFilepath: null,
  stats: {
    assets: true,
    chunks: true,
    modules: true,
  },
};

const isWebpack5 = parseInt(webpack.version, 10) === 5;

async function sendStats(
  compilation: Compilation,
  options: RelativeCIAgentWebpackPluginOptions,
): Promise<void> {
  const { stats: statsOptions, failOnError, ...config } = options;
  const data = compilation.getStats().toJson(statsOptions);

  const logger = compilation.compiler?.getInfrastructureLogger
    ? compilation.compiler.getInfrastructureLogger(PLUGIN_NAME)
    : console;

  try {
    validateWebpackStats(data);

    const params = await loadEnv(
      { agentType: 'webpack-plugin' },
      { includeCommitMessage: config?.includeCommitMessage },
      logger,
    );
    const artifactsData = filterArtifacts([{ key: SOURCE_WEBPACK_STATS, data }]);
    const response = await ingest(artifactsData, params, config, logger);

    logResponse(response);
  } catch (error: any) {
    if (failOnError) {
      logger.error(error);
      compilation.errors.push(error);
    } else {
      logger.warn(error); // catch error to prevent failure on error
    }
  }
}

class RelativeCIAgentWebpackPlugin {
  options: RelativeCIAgentWebpackPluginOptions;

  constructor(options: RelativeCIAgentWebpackPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    const enabled = isCi();

    const options: RelativeCIAgentWebpackPluginOptions = _.merge(
      {},
      DEFAULT_OPTIONS,
      {
        enabled,
      },
      this.options,
    );

    debug(options);

    // Skip if not enabled
    if (!options.enabled) {
      debug(`${PLUGIN_NAME} is disabled, skip sending data`);
      return;
    }

    if (isWebpack5) {
      compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
        compilation.hooks.processAssets.tap(
          { name: PLUGIN_NAME, stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT },
          () => sendStats(compilation, options),
        );
      });

      return;
    }

    compiler.hooks.emit.tapAsync(
      PLUGIN_NAME,
      async (compilation, callback) => {
        await sendStats(compilation, options);
        callback();
      },
    );
  }
}

export default RelativeCIAgentWebpackPlugin;
