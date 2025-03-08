const { exec } = require('child_process');

const { createServer } = require('../../utils');

const MOCK_SERVER_PORT = 5998;

const testCases = [
  { type: 'commonjs', run: 'build' },
  { type: 'mjs', run: 'build-mjs' },
  { type: 'esm', cwd: 'config-module', run: 'build' },
  { type: 'ts', run: 'build-ts' },
];

describe('webpack-plugin / build / webpack5', () => {
  let server;

  beforeAll(() => {
    server = createServer().listen(MOCK_SERVER_PORT);
  });

  afterAll(() => {
    server.close();
  });

  testCases.forEach((testCase) => {
    test(`should build successfully with webpack ${testCase.type} config`, (done) => {
      exec(`cd test/webpack/webpack5/${testCase.cwd || ''} &&
          CI=true \
          RELATIVE_CI_ENDPOINT=http://localhost:${MOCK_SERVER_PORT}/save \
          RELATIVE_CI_SLUG=org/project \
          RELATIVE_CI_KEY=abc123 \
        npm run ${testCase.run}`, (_, stdout, sterr) => {
        expect(sterr).toEqual('');
        expect(stdout).toMatch(/compiled.*successfully/);
        expect(stdout).toContain('Job #1 done.');
        done();
      });
    });
  });
});
