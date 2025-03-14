import { exec } from 'child_process';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  beforeAll, afterAll, describe, expect, test,
} from 'vitest';

// eslint-disable-next-line import/no-relative-packages
import { MOCK_SERVER_URL, serve as createServer } from '../utils';

describe('CLI', () => {
  let server;

  beforeAll(() => {
    server = createServer();
  });

  afterAll(() => {
    server.close();
  });

  test('should return error if config is missing', (done) => {
    exec('cd test/cli && npx relative-ci', (_, __, sterr) => {
      expect(sterr).toContain('relativeci.config.js file is missing!');
      done();
    });
  });

  test('should return error if webpack stats is missing', (done) => {
    exec('cd test/cli/missing-stats && npx relative-ci', (_, __, sterr) => {
      expect(sterr).toContain('file does not exists');
      done();
    });
  });

  test('should return error if webpack stats data is invalid', (done) => {
    exec('cd test/cli/invalid-data && npx relative-ci', (_, __, sterr) => {
      expect(sterr).toContain('Invalid stats structure');
      done();
    });
  });

  test('should return error if params are failing', (done) => {
    exec(`cd test/cli/valid-data &&
      RELATIVE_CI_ENDPOINT=${MOCK_SERVER_URL}/save \
      RELATIVE_CI_SLUG=org/project \
      npx relative-ci`, (_, __, sterr) => {
      expect(sterr).toContain('parameter is missing');
      done();
    });
  });

  test('should run agent successfully', (done) => {
    exec(
      `cd test/cli/valid-data &&
        RELATIVE_CI_ENDPOINT=${MOCK_SERVER_URL}/save \
        RELATIVE_CI_SLUG=org/project \
        RELATIVE_CI_KEY=abc123 \
        npx relative-ci
      `,
      (_, stdout, sterr) => {
        expect(sterr).toEqual('');
        expect(stdout).toContain('Job #1 done.');
        done();
      },
    );
  });

  test('should run agent successfully from parent directory', (done) => {
    exec(
      `cd test/cli/custom-config-dir &&
        RELATIVE_CI_ENDPOINT=${MOCK_SERVER_URL}/save \
        RELATIVE_CI_SLUG=org/project \
        RELATIVE_CI_KEY=abc123 \
        npx relative-ci --config-dir app
      `,
      (_, stdout, sterr) => {
        expect(sterr).toEqual('');
        expect(stdout).toContain('Job #1 done.');
        done();
      },
    );
  });
});
