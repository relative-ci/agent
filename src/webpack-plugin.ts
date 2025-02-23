import webpack, {
  Compilation, type Compiler, type Configuration,
} from 'webpack';
import merge from 'lodash/merge';
import validate from '@bundle-stats/plugin-webpack-validate';

import * as LOCALES from './locales/en';
import { debug, getEnvVars, logResponse } from './utils';
import { normalizeParams } from './utils/normalize-params';
import { PluginConfig, SOURCE_WEBPACK_STATS } from './constants';
import ingest from './ingest';
import { filterArtifacts } from './utils/filter-artifacts';

type RelativeCiAgentWebpackPluginOptions = {
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
  options: RelativeCiAgentWebpackPluginOptions,
): Promise<void> {
  const { stats: statsOptions, failOnError, ...config } = options;
  const data = compilation.getStats().toJson(statsOptions);

  const logger = compilation.compiler?.getInfrastructureLogger
    ? compilation.compiler.getInfrastructureLogger(PLUGIN_NAME)
    : console;

  try {
    const invalidData = validate(data);

    if (invalidData) {
      throw new Error(LOCALES.VALIDATE_ERROR);
    }

    const params = normalizeParams({}, config);
    const artifactsData = filterArtifacts([{ key: SOURCE_WEBPACK_STATS, data }]);
    const response = await ingest(artifactsData, params, config, logger);

    logResponse(response);
  } catch (error: any) {
    if (failOnError) {
      compilation.errors.push(error);
    } else {
      logger.warn(error); // catch error to prevent failure on error
    }
  }
}

export class RelativeCiAgentWebpackPlugin {
  options: RelativeCiAgentWebpackPluginOptions;

  constructor(options: RelativeCiAgentWebpackPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    const { isCi } = getEnvVars();

    const options: RelativeCiAgentWebpackPluginOptions = merge(
      {},
      DEFAULT_OPTIONS,
      {
        enabled: isCi,
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
