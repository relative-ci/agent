#!/usr/bin/env node

const { get } = require('lodash');
const { readJSONSync, pathExistsSync } = require('fs-extra');
const { cosmiconfigSync } = require('cosmiconfig');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const validate = require('@bundle-stats/plugin-webpack-validate').default;

const { agent } = require('../lib/agent');
const { debug } = require('../lib/utils');
const LOCALES = require('../locales/en');

const searchConfig = cosmiconfigSync('relativeci').search();
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

const webpackArtifactFilepath = get(config, 'webpack.stats');

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

const args = yargs(hideBin(process.argv))
  .usage('Usage: $0 OPTIONS')
  .option('commit', { describe: 'Commit SHA', default: '' })
  .option('commit-message', { describe: 'Commit message', default: '', alias: 'commitMessage' })
  .option('branch', { describe: 'Branch name', default: '' })
  .option('pr', { describe: 'Pull Request number', default: '' })
  .option('slug', { describe: 'Project slug', default: '' })
  .help()
  .argv;

debug('CLI arguments', args);

agent(artifactsData, config, args);
