const SETUP_INFO = 'Read more about RelativeCI agent setup at https://relative-ci.com/documentation/setup.';

module.exports.GENERIC_ERROR = 'Something went wrong';

module.exports.CLI_MISSING_CONFIGURATION_ERROR = `relativeci.config.js file is missing! ${SETUP_INFO}`;
module.exports.CLI_INVALID_CONFIGURATION_ERROR = `The path to your webpack stats file is missing! ${SETUP_INFO}`;
module.exports.CLI_MISSING_STATS_FILE_ERROR = `The webpack stats file does not exists! ${SETUP_INFO}`;

module.exports.AGENT_MISSING_KEY_ERROR = `"key" parameter is missing, make sure to set RELATIVE_CI_KEY environment variable! ${SETUP_INFO}`;
module.exports.AGENT_MISSING_SLUG_ERROR = `"slug" parameter is missing, make sure to set RELATIVE_CI_SLUG environment variable (RELATIVE_CI_SLUG=organization-a/project-a) if you are not using a supported CI service! ${SETUP_INFO}`;
module.exports.AGENT_MISSING_COMMIT_ERROR = `"commit" environment variable is missing, make sure the agent is setup correctly! ${SETUP_INFO}`;
module.exports.AGENT_MISSING_BRANCH_ERROR = `"branch" environment variable is missing, make sure the agent is setup correctly! ${SETUP_INFO}`;
