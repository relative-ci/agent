import nodeFetch from 'node-fetch';

import ingest from '../ingest';

jest.mock('node-fetch', () => jest.fn());
const fetch = nodeFetch as jest.MockedFunction<typeof nodeFetch>;

describe('Ingest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should ingest data', async () => {
    fetch.mockResolvedValueOnce({
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
    } as any);

    await ingest({}, {
      key: 'abc-123',
      endpoint: 'http://localhost',
      agentVersion: '0.0.0',
      slug: 'organization/project',
      commit: 'abcd1234',
      branch: 'master',
      build: '123',
      buildUrl: '#',
      pr: '12',
      commitMessage: 'Commit message',
    });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost',
      {
        body: JSON.stringify({
          key: 'abc-123',
          project: 'organization/project',
          agentVersion: '0.0.0',
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

  test.only('should show error when the ingest action fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await ingest({}, {
      key: 'abc-123',
      endpoint: 'http://localhost',
      agentVersion: '0.0.0',
      slug: 'organization/project',
      commit: 'abcd1234',
      branch: 'master',
    });

    expect(fetch).toHaveBeenCalled();
    expect(fetch).rejects.toBeTruthy();
  });
});
