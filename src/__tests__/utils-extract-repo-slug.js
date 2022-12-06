const { extractRepoSlug } = require('../utils');

describe('Utils - extractRepoSlug', () => {
  test('should fallback when the data is missing or invalid', () => {
    expect(extractRepoSlug(undefined)).toEqual('');
    expect(extractRepoSlug('')).toEqual('');
    expect(extractRepoSlug('invalid-url')).toEqual('');
  });

  test('should extract slug from ssh URLs', () => {
    expect(extractRepoSlug('git@github.com:relative-ci/agent.git')).toEqual('relative-ci/agent');
  });

  test('should extract slug from http(s) URLs', () => {
    expect(extractRepoSlug('https://github.com/relative-ci/agent.git')).toEqual('relative-ci/agent');
  });
});
