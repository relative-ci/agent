import nodeFetch from 'node-fetch';

import ingest from '../ingest';

jest.mock('node-fetch', () => jest.fn());
const fetch = nodeFetch as jest.MockedFunction<typeof nodeFetch>;

describe('Ingest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('send data to the ingest endpoint', async () => {
    await ingest({}, {
      key: 'abc-123',
      endpoint: 'http://localhost/ingest',
      agentVersion: '0.0.0',
      slug: 'org/project',
      commit: 'abcd1234',
      branch: 'main',
    });

    expect(fetch).toHaveBeenCalled();
  });
});
