#!/usr/bin/env node

// @ts-expect-error Module available after build
const cli = require('../lib/cjs/cli').default; // eslint-disable-line

cli(process.argv);
