#!/usr/bin/env node

require('dotenv').config();

const yargs = require('yargs');
const envCi = require('env-ci');
const fs = require('fs-extra');
const { pick } = require('lodash');

const { debug } = require('../lib/utils');
const { send } = require('../lib');
const packageInfo = require('../package.json');

const DEFAULT_ENDPOINT = 'https://api.relative-ci.com/save';
const KEY = process.env.RELATIVE_CI_KEY;
const ENDPOINT = process.env.RELATIVE_CI_ENDPOINT || DEFAULT_ENDPOINT;

const envs = envCi();

debug('CI env variables', envs);

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
    },
    webpackStats: {
      demandOption: true,
    },
  })
  .help().argv;

// Pick only the required data
const stats = pick(fs.readJSONSync(args.webpackStats), ['assets', 'entrypoints']);

send(stats, {
  ...envs,
  ...args,
  agentVersion: packageInfo.version,
});
