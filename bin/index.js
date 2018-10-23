#!/usr/bin/env node

require('dotenv').config();

const yargs = require('yargs');
const envCi = require('env-ci');
const cosmiconfig = require('cosmiconfig');

const { debug, getCommitMessage } = require('../lib/utils');
const agent = require('../lib');
const packageInfo = require('../package.json');

const DEFAULT_ENDPOINT = 'https://api.relative-ci.com/save';

const KEY = process.env.RELATIVE_CI_KEY;
const ENDPOINT = process.env.RELATIVE_CI_ENDPOINT || DEFAULT_ENDPOINT;

const envs = envCi();
debug('CI env variables', envs);

const searchConfig = cosmiconfig('relativeci');
const { config } = searchConfig.searchSync();
debug('Config', config);

const args = yargs
  .options({
    key: {
      default: KEY,
      demandOption: true,
    },
    endpoint: {
      default: ENDPOINT,
      demandOption: true,
    },
    commit: {
      default: envs.commit,
      demandOption: true,
    },
    branch: {
      default: envs.branch,
      demandOption: true,
    },
    build: {
      default: envs.build,
    }
  })
  .help().argv;

const commitMessage = config.includeCommitMessage ? getCommitMessage() : '';

// @TODO Add error handling here
agent({
  config,
  params: {
    ...envs,
    ...args,
    commitMessage,
    agentVersion: packageInfo.version,
  },
});
