import { exec } from 'child_process';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  afterAll, beforeAll, describe, expect, test,
} from 'vitest';

// eslint-disable-next-line import/no-relative-packages
import { MOCK_SERVER_URL, serve } from '../../utils';

const testCases = [
  { type: 'commonjs', run: 'build' },
  { type: 'mjs', run: 'build-mjs' },
  { type: 'esm', cwd: 'config-module', run: 'build' },
  { type: 'ts', run: 'build-ts' },
];

describe('webpack-plugin / build / webpack5', () => {
  let server;

  beforeAll(() => {
    server = serve();
  });

  afterAll(() => {
    server.close();
  });

  testCases.forEach((testCase) => {
    test(`should build successfully with webpack ${testCase.type} config`, () => new Promise((done) => {
      exec(`cd test/webpack/webpack5/${testCase.cwd || ''} &&
          CI=true \
          RELATIVE_CI_ENDPOINT=${MOCK_SERVER_URL}/save \
          RELATIVE_CI_SLUG=org/project \
          RELATIVE_CI_KEY=abc123 \
        npm run ${testCase.run}`, (_, stdout, sterr) => {
        expect(sterr).toEqual('');
        expect(stdout).toMatch(/compiled.*successfully/);
        expect(stdout).toContain('Job #1 done.');
        done(1);
      });
    }));
  });
});
