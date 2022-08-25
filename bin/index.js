#!/usr/bin/env node

const path = require('path');
const { get } = require('lodash');
const { readJSONSync, pathExistsSync } = require('fs-extra');
const { cosmiconfigSync } = require('cosmiconfig');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const validate = require('@bundle-stats/plugin-webpack-validate').default;

const { agent } = require('../lib/agent');
const { debug } = require('../lib/utils');
const LOCALES = require('../locales/en');

const args = yargs(hideBin(process.argv))
  .usage('Usage: $0 OPTIONS')

  .option('config-dir', { describe: 'Config directory', default: '', alias: 'c' })

  .option('commit', { describe: 'Commit SHA', default: '' })
  .option('commit-message', { describe: 'Commit message', default: '', alias: 'commitMessage' })
  .option('branch', { describe: 'Branch name', default: '' })
  .option('pr', { describe: 'Pull Request number', default: '' })
  .option('slug', { describe: 'Project slug', default: '' })

  .help()
  .argv;

const searchConfig = cosmiconfigSync('relativeci').search(args['config-dir']);
debug('Config', searchConfig);

if (!searchConfig) {
  console.error(LOCALES.CLI_MISSING_CONFIGURATION_ERROR);
  process.exit(0);
}

const { config } = searchConfig;

if (!get(config, 'webpack.stats')) {
  console.error(LOCALES.CLI_INVALID_CONFIGURATION_ERROR);
  process.exit(0);
}

// Load webpack stats file relative to the config file
const webpackArtifactFilepath = path.join(
  path.dirname(searchConfig.filepath),
  get(config, 'webpack.stats'),
);

if (!pathExistsSync(webpackArtifactFilepath)) {
  console.error(LOCALES.CLI_MISSING_STATS_FILE_ERROR);
  process.exit(0);
}

const data = readJSONSync(webpackArtifactFilepath);

const invalidData = validate(data);

if (invalidData) {
  console.error(invalidData);
  process.exit(0);
}

const artifactsData = [
  {
    key: 'webpack.stats',
    data: readJSONSync(webpackArtifactFilepath),
  },
];

debug('CLI arguments', args);

agent(artifactsData, config, args);
