const { exec } = require('child_process');

describe('CLI', () => {
  test('should return error if config is missing', () => {
    exec('./bin/index.js', (error, stdout, sterr) => {
      expect(sterr).toContain('relativeci.config.js file is missing!');
    });
  });

  test('should return error if webpack stats is missing', () => {
    exec('cd test/cli/missing-stats && ../../../bin/index.js', (error, stdout, sterr) => {
      expect(sterr).toContain('file does not exists');
    });
  });
});
