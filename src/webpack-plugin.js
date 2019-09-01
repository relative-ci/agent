import process from 'process';
import { get, merge } from 'lodash';

import { agent } from './agent';
import { getEnvCI } from './utils';

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

const getOnEmit = (options) => async (compilation, callback) => {
  const { stats: statsOptions, ...agentOptions } = options;
  const data = compilation.getStats().toJson(statsOptions);

  const logger = compilation.getInfrastructureLogger
    ? compilation.getInfrastructureLogger(PLUGIN_NAME)
    : console;

  try {
    await agent([{ key: 'webpack.stats', data }], agentOptions, logger);

    callback();
  } catch (err) {
    callback(err);
  }
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

    // Skip if not enabled
    if (!options.enabled) {
      return;
    }

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, getOnEmit(options));
  }
}
