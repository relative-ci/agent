import { type CiEnv } from 'env-ci';

// Match slug on SSH URLs (ex: `USER@HOST:PORT/ORG/REPO.git`)
const GIT_SSH_URL_SLUG_PATTERN = /^(?:.*)@(?:.*):(?:\d+\/)?(.*)\.git$/;

// Match slug on HTTP(S) URLs `https://github.com/relative-ci/agent.git`
const GIT_PATHNAME_SLUG_PATTERN = /^\/(.*)\.git$/;

/**
 * Extract repository slug(owner/repo) from the repo URL
 */
export function getSlugFromGitURL(repositoryURL?: string): string | undefined {
  if (!repositoryURL) {
    return undefined;
  }

  if (repositoryURL.match(GIT_SSH_URL_SLUG_PATTERN)) {
    return repositoryURL.replace(GIT_SSH_URL_SLUG_PATTERN, '$1');
  }

  try {
    const url = new URL(repositoryURL);
    return url.pathname.replace(GIT_PATHNAME_SLUG_PATTERN, '$1');
  } catch (err) {
    if (err instanceof Error) {
      console.warn(err.message);
    }
    return undefined;
  }
}

/**
 * Resolve repository slug
 */
export function getSlug(envVars: CiEnv): string {
  // env-ci does not provide a slug for jenkins
  // https://github.com/semantic-release/env-ci/blob/master/services/jenkins.js#LL18
  // https://www.jenkins.io/doc/book/pipeline/jenkinsfile/#using-environment-variables
  // https://plugins.jenkins.io/git/#plugin-content-environment-variables
  if ('service' in envVars && envVars.service === 'jenkins') {
    return getSlugFromGitURL(process.env.GIT_URL || '') || '';
  }

  return 'slug' in envVars ? envVars.slug : '';
}
