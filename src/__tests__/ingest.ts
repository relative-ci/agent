import nodeFetch from 'node-fetch';

import ingest from '../ingest';

jest.mock('node-fetch', () => jest.fn());
const fetch = nodeFetch as jest.MockedFunction<typeof nodeFetch>;

describe('Ingest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('send data to the ingest endpoint', async () => {
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
      slug: 'org/project',
      commit: 'abcd1234',
      branch: 'master',
    });

    expect(fetch).toHaveBeenCalled();
  });

  test('received invalid data from the ingest endpoint', () => {});
});
