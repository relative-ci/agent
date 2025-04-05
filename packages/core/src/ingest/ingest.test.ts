import {
  afterEach, describe, expect, test, vi,
} from 'vitest';

import ingest from './ingest';

const PARAMS = {
  key: 'abc-123',
  endpoint: 'http://localhost',
  agentVersion: '0.0.0',
  agentType: 'test',
  slug: 'organization/project',
  commit: 'abcd1234',
  branch: 'master',
  build: '123',
  buildUrl: '#',
  pr: '12',
  commitMessage: 'Commit message',
};

describe('Ingest', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should ingest data', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve({
        res: {
          job: {
            internalBuildNumber: '10',
          },
        },
        info: {
          message: {
            txt: 'Done',
          },
        },
      }),
    }) as any);

    await ingest({ }, PARAMS);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost',
      {
        body: JSON.stringify({
          key: 'abc-123',
          project: 'organization/project',
          agentVersion: '0.0.0',
          agentType: 'test',
          job: {
            commit: 'abcd1234',
            branch: 'master',
            prNumber: '12',
            buildNumber: '123',
            buildUrl: '#',
            commitMessage: 'Commit message',
          },
          rawData: {},
        }),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        method: 'POST',
      },
    );
  });

  test('should throw error when fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    try {
      await ingest({}, PARAMS);
    } catch (error: any) {
      expect(error.cause.message).toEqual('Network error');
    }
  });

  test('should throw error when fetch returns invalid json', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve(null),
    }) as any);

    try {
      await ingest({}, PARAMS);
    } catch (error: any) {
      expect(error.message).toMatch(/invalid data/);
    }
  });

  test('should throw error when ingest returns error', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve({
        code: 'INGEST_FAILED',
        message: 'Ingest failed',
      }),
    }) as any);

    try {
      await ingest({}, PARAMS);
    } catch (error: any) {
      expect(error.message).toMatch(/Ingest failed/);
    }
  });

  test('should throw error when ingest response is invalid', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve({}),
    }) as any);

    try {
      await ingest({}, PARAMS);
    } catch (error: any) {
      expect(error.message).toMatch(/invalid data/);
    }
  });
});
