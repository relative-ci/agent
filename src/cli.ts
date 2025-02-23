import path from 'path';
import get from 'lodash/get';
import { readJSONSync, pathExistsSync } from 'fs-extra';
import { cosmiconfigSync } from 'cosmiconfig';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import validate from '@bundle-stats/plugin-webpack-validate';

import * as LOCALES from './locales/en';
import { SOURCE_WEBPACK_STATS } from './constants';
import { debug } from './utils/debug';
import { logResponse } from './utils/log-response';
import { normalizeParams } from './utils/normalize-params';
import { filterArtifacts } from './utils/filter-artifacts';
import ingest from './ingest';

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

  if (!get(config, 'webpack.stats')) {
    throw new Error(LOCALES.CLI_INVALID_CONFIGURATION_ERROR);
  }

  // Load webpack stats file relative to the config file
  const webpackArtifactFilepath = path.join(
    path.dirname(searchConfig.filepath),
    get(config, 'webpack.stats'),
  );

  if (!pathExistsSync(webpackArtifactFilepath)) {
    throw new Error(LOCALES.CLI_MISSING_STATS_FILE_ERROR);
  }

  const data = readJSONSync(webpackArtifactFilepath);

  const invalidData = validate(data);

  if (invalidData) {
    throw new Error(invalidData);
  }

  debug('CLI arguments', args);

  const params = normalizeParams(args, config);
  const artifactsData = filterArtifacts([{ key: SOURCE_WEBPACK_STATS, data }]);

  const response = await ingest(artifactsData, params, config);
  logResponse(response);
}
