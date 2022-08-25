const http = require('http');
const { exec } = require('child_process');

const MOCK_RESULT = {
  res: {
    job: {
      internalBuildNumber: 1,
    },
  },
  info: {
    message: {
      txt: 'Hello world!',
    },
  },
};

const MOCK_SERVER_PORT = 5998;

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

  test('should run agent successfully', (done) => {
    const server = http.createServer((req, res) => {
      res.write(JSON.stringify(MOCK_RESULT));
      res.end();
    }).listen(MOCK_SERVER_PORT);

    exec(
      `cd test/cli/valid-data &&
        RELATIVE_CI_ENDPOINT=http://localhost:${MOCK_SERVER_PORT}/save \
        RELATIVE_CI_SLUG=org/project \
        RELATIVE_CI_KEY=abc123 \
        ../../../bin/index.js
      `,
      (_, stdout, sterr) => {
        expect(stdout).toContain('Job #1 done.');
        server.close();
        done();
      },
    );
  });
});
