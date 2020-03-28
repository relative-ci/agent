const { exec } = require('child_process');
const assert = require('assert');

describe('CLI', () => {
  it('should return error if config is missing', () => {
    exec('./bin/index.js', (error, stdout, sterr) => {
      assert.ok(sterr.match(/relativeci.config.js file is missing!/));
    });
  });

  it('should return error if webpack stats is missing', () => {
    exec('cd test/cli/missing-stats && ../../../bin/index.js', (error, stdout, sterr) => {
      assert.ok(sterr.match(/file does not exists/));
    });
  });
});
