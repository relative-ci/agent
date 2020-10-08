import process from 'process';
import webpack from 'webpack';
import { get, merge } from 'lodash';
import { validate } from '@bundle-stats/utils/lib/webpack';

import { agent } from './agent';
import { debug, getEnvCI } from './utils';

const PLUGIN_NAME = 'RelativeCiAgent';

const DEFAULT_OPTIONS = {
  includeCommitMessage: true,
  stats: {
    context: process.cwd(),
    assets: true,
    entrypoints: true,
    chunks: true,
    modules: true,
  },
};

const isWebpack5 = parseInt(webpack.version, 10) === 5;

const generateReports = async (compilation, options) => {
  const { stats: statsOptions, ...agentOptions } = options;
  const data = compilation.getStats().toJson(statsOptions);

  const logger = compilation.getInfrastructureLogger
    ? compilation.getInfrastructureLogger(PLUGIN_NAME)
    : console;

  const invalidData = validate(data);

  if (invalidData) {
    logger.warn(invalidData);
    return;
  }

  agent([{ key: 'webpack.stats', data }], agentOptions, logger);
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
        stats: {
          context: get(compiler, 'options.context'),
        },
      },
      this.options,
    );

    debug(options);

    // Skip if not enabled
    if (!options.enabled) {
      debug('RelativeCIAgentWebpackPlugin is disabled, skip sending data');
      return;
    }

    if (isWebpack5) {
      compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
        compilation.hooks.processAssets.tap(
          { name: PLUGIN_NAME, stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ANALYSE },
          () => generateReports(compilation, options),
        );
      });

      return;
    }

    compiler.hooks.emit.tapAsync(
      PLUGIN_NAME,
      async (compilation, callback) => {
        await generateReports(compilation, options);
        callback();
      },
    );
  }
}
