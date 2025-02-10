#!/usr/bin/env node

// eslint-disable-next-line
const cli = require('../lib/cli').default;

(async () => {
  try {
    await cli(process.argv);
  } catch (error) {
    console.error(error.message);
    process.exit(0);
  }
})();
