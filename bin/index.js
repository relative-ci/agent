#!/usr/bin/env node

// @ts-expect-error Module available after build
const cli = require('../lib/cli').default; // eslint-disable-line

cli(process.argv);
