import path from 'path';
import _ from 'lodash';
import { readJSONSync, pathExistsSync } from 'fs-extra';
import { cosmiconfigSync } from 'cosmiconfig';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import {
  SOURCE_WEBPACK_STATS,
  debug,
  logResponse,
  filterArtifacts,
  validateWebpackStats,
} from '@relative-ci/core';
// eslint-disable-next-line import/no-unresolved
import loadEnv from '@relative-ci/core/env';
// eslint-disable-next-line import/no-unresolved
import ingest from '@relative-ci/core/ingest';
// eslint-disable-next-line import/no-unresolved
import * as LOCALES from '@relative-ci/core/locales/en';

export default async function cli(processArgs: Array<string>) {
  const args = await yargs(hideBin(processArgs))
    .usage('Usage: $0 OPTIONS')

    .option('config-dir', { describe: 'Config directory', default: '', alias: 'c' })

    .option('commit', { describe: 'Commit SHA', default: '' })
    .option('commit-message', { describe: 'Commit message', default: '', alias: 'commitMessage' })
    .option('branch', { describe: 'Branch name', default: '' })
    .option('pr', { describe: 'Pull Request number', default: '' })
    .option('slug', { describe: 'Project slug', default: '' })

    .help()
    .argv;

  const searchConfig = cosmiconfigSync('relativeci', {
    searchStrategy: 'global',
  }).search('config-dir' in args ? args['config-dir'] : undefined);

  debug('Config', searchConfig);

  if (!searchConfig) {
    throw new Error(LOCALES.CLI_MISSING_CONFIGURATION_ERROR);
  }

  const { config } = searchConfig;

  if (!_.get(config, 'webpack.stats')) {
    throw new Error(LOCALES.CLI_INVALID_CONFIGURATION_ERROR);
  }

  // Load webpack stats file relative to the config file
  const webpackArtifactFilepath = path.join(
    path.dirname(searchConfig.filepath),
    _.get(config, 'webpack.stats'),
  );

  if (!pathExistsSync(webpackArtifactFilepath)) {
    throw new Error(LOCALES.CLI_MISSING_STATS_FILE_ERROR);
  }

  const data = readJSONSync(webpackArtifactFilepath);

  validateWebpackStats(data);

  debug('CLI arguments', args);

  const params = loadEnv(args, config);
  const artifactsData = filterArtifacts([{ key: SOURCE_WEBPACK_STATS, data }]);

  const response = await ingest(artifactsData, params, config);
  logResponse(response);
}
