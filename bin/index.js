#!/usr/bin/env node

const { get } = require('lodash');
const { readJSONSync, pathExistsSync } = require('fs-extra');
const { cosmiconfigSync } = require('cosmiconfig');

const { agent } = require('../');
const { debug } = require('../lib/utils');

const searchConfig = cosmiconfigSync('relativeci').search();

debug('Config', searchConfig);

if (!searchConfig) {
  console.error('You need to provide a config file! Read more on https://relative-ci.com/documentation/setup#22-configuration.');
  process.exit(1);
}

const { config } = searchConfig;

if (!get(config, 'webpack.stats')) {
  console.error('The path to your webpack stats file is missing! Read more on https://relative-ci.com/documentation/setup#22-configuration.');
  process.exit(1);
}

const webpackArtifactFilepath = get(config, 'webpack.stats');

if (!pathExistsSync(webpackArtifactFilepath)) {
  console.error(`The webpack stats file does not exists(${webpackArtifactFilepath})! Read more on https://relative-ci.com/documentation/setup#1-configure-webpack.`);
  process.exit(1);
}

const artifactsData = [
  {
    key: 'webpack.stats',
    data: readJSONSync(webpackArtifactFilepath),
  },
];

agent(artifactsData, config);
