import webpack from 'webpack';
import { merge } from 'lodash';
import validate from '@bundle-stats/plugin-webpack-validate';

import { agent } from './agent';
import { debug, getEnvCI } from './utils';

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

const sendStats = async (compilation, options) => {
  const { stats: statsOptions, ...config } = options;
  const data = compilation.getStats().toJson(statsOptions);

  const logger = compilation.getInfrastructureLogger
    ? compilation.getInfrastructureLogger(PLUGIN_NAME)
    : console;

  const invalidData = validate(data);

  if (invalidData) {
    logger.warn(invalidData);
    return;
  }

  agent([{ key: 'webpack.stats', data }], config, undefined, logger);
};

export class RelativeCiAgentWebpackPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { isCi } = getEnvCI();

    const options = merge(
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
