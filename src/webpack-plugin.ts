import webpack, { type Compiler, type Configuration } from 'webpack';
import { merge } from 'lodash';
import validate from '@bundle-stats/plugin-webpack-validate';

import { debug, getEnvVars } from './utils';
import { normalizeParams } from './utils/normalize-params';
import { SOURCE_WEBPACK_STATS } from './constants';
import ingest from './ingest';
import { filterArtifacts } from './utils/filter-artifacts';

type RelativeCiAgentWebpackPluginOptions = {
  /**
   * Plugin is enabled - sends data to RelativeCI
   * @default env-ci isCi value
   */
  enabled?: boolean;
  /**
   * Read commit message from git
   * @default true
   */
  includeCommitMessage?: boolean;
  /**
   * Output payload on a local file for debugging
   */
  payloadFilepath?: string;
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

const sendStats = async (
  compilation: any,
  options: RelativeCiAgentWebpackPluginOptions,
) => {
  const { stats: statsOptions, ...config } = options;
  const data = compilation.getStats().toJson(statsOptions);

  const logger = compilation.getInfrastructureLogger
    ? compilation.getInfrastructureLogger(PLUGIN_NAME)
    : console;

  // @ts-expect-error incorrect type export
  const invalidData = validate.default(data);

  if (invalidData) {
    return logger.warn(invalidData);
  }

  let params;

  try {
    params = normalizeParams({}, config);
  } catch (error) {
    return logger.warn(error);
  }

  const artifactsData = filterArtifacts([{ key: SOURCE_WEBPACK_STATS, data }]);

  return ingest(artifactsData, params, config, logger);
};

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
