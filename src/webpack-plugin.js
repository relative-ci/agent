import process from 'process';
import { get, merge } from 'lodash';

import { agent } from './agent';

const PLUGIN_NAME = 'RelativeCIAgent';

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

  // @TODO: Pass to agent
  const logger = compilation.getInfrastructureLogger
    ? compilation.getInfrastructureLogger(PLUGIN_NAME)
    : console;

  try {
    await agent([{
      key: 'webpack.stats',
      data,
    }], agentOptions);

    callback();
  } catch (err) {
    callback(err);
  }
};

export class RelativeCIAgentWebpackPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const options = merge(
      {},
      DEFAULT_OPTIONS,
      {
        stats: {
          context: get(compiler, 'options.context'),
        },
      },
      this.options,
    );

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, getOnEmit(options));
  }
}
