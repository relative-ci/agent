#!/usr/bin/env node

const cli = require('../lib/cjs/cli'); // eslint-disable-line

(async () => {
  try {
    await cli(process.argv);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
