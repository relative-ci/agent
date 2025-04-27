import dotenv from 'dotenv';

export default function getProcessEnv() {
  dotenv.config();

  const {
    // Agent env vars
    RELATIVE_CI_KEY,
    RELATIVE_CI_ENDPOINT,

    RELATIVE_CI_SERVICE,
    RELATIVE_CI_SLUG,

    RELATIVE_CI_BRANCH,
    RELATIVE_CI_PR,
    RELATIVE_CI_BUILD,
    RELATIVE_CI_BUILD_URL,
    RELATIVE_CI_COMMIT,
    RELATIVE_CI_COMMIT_MESSAGE,

    // Jenkins GIT_URL
    // https://www.jenkins.io/doc/book/pipeline/jenkinsfile/#using-environment-variables
    GIT_URL: JENKINS_GIT_URL,

    // GitHub Action
    GITHUB_EVENT_PATH,
  } = process.env;

  return {
    RELATIVE_CI_KEY,
    RELATIVE_CI_ENDPOINT,

    RELATIVE_CI_SERVICE,
    RELATIVE_CI_SLUG,

    RELATIVE_CI_BRANCH,
    RELATIVE_CI_PR,
    RELATIVE_CI_BUILD,
    RELATIVE_CI_BUILD_URL,
    RELATIVE_CI_COMMIT,
    RELATIVE_CI_COMMIT_MESSAGE,

    JENKINS_GIT_URL,
    GITHUB_EVENT_PATH,
  };
}
