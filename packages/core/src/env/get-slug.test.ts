import { describe, expect, test } from 'vitest';

import { getSlugFromGitURL } from './get-slug';

describe('getSlugFromGitURL', () => {
  test('should fallback when the data is missing or invalid', () => {
    expect(getSlugFromGitURL(undefined)).toEqual(undefined);
    expect(getSlugFromGitURL('')).toEqual(undefined);
    expect(getSlugFromGitURL('invalid-url')).toEqual(undefined);
  });

  test('should extract slug from ssh URLs', () => {
    expect(getSlugFromGitURL('git@github.com:relative-ci/agent.git')).toEqual('relative-ci/agent');
    expect(getSlugFromGitURL('user@host.com:9418/relative-ci/agent.git')).toEqual('relative-ci/agent');
    expect(getSlugFromGitURL('user@192.169.0.1:9418/relative-ci/agent.git')).toEqual('relative-ci/agent');
  });

  test('should extract slug from http(s) URLs', () => {
    expect(getSlugFromGitURL('https://github.com/relative-ci/agent.git')).toEqual('relative-ci/agent');
  });
});
