import path from 'path';
import { get } from 'lodash';
import { readJSONSync, pathExistsSync } from 'fs-extra';
import { cosmiconfigSync } from 'cosmiconfig';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import validate from '@bundle-stats/plugin-webpack-validate';

import * as LOCALES from './locales/en';
import { debug } from './utils';
import { normalizeParams } from './utils/normalize-params';
import ingest from './ingest';
import { filterArtifacts } from './utils/filter-artifacts';
import { SOURCE_WEBPACK_STATS } from './constants';

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

  // @ts-expect-error incorrect type export
  const invalidData = validate.default(data);

  if (invalidData) {
    throw new Error(invalidData);
  }

  debug('CLI arguments', args);

  const params = normalizeParams(args, config);
  const artifactsData = filterArtifacts([{ key: SOURCE_WEBPACK_STATS, data }]);

  await ingest(artifactsData, params, config);
}
