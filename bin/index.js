#!/usr/bin/env node

// @ts-expect-error Module available after build
const cli = require('../lib/cli').default; // eslint-disable-line

(async () => {
  try {
    await cli(process.argv);
  } catch (error) {
    console.error(error.message);
    process.exit(0);
  }
})();
