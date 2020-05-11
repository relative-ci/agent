const { exec } = require('child_process');

describe('CLI', () => {
  test('should return error if config is missing', (done) => {
    exec('./bin/index.js', (error, stdout, sterr) => {
      expect(sterr).toContain('relativeci.config.js file is missing!');
      done();
    });
  });

  test('should return error if webpack stats is missing', (done) => {
    exec('cd test/cli/missing-stats && ../../../bin/index.js', (error, stdout, sterr) => {
      expect(sterr).toContain('file does not exists');
      done();
    });
  });

  test('should return error if webpack stats data is invalid', (done) => {
    exec('cd test/cli/invalid-data && ../../../bin/index.js', (error, stdout, sterr) => {
      expect(sterr).toContain('Invalid webpack stats structure');
      done();
    });
  });
});
