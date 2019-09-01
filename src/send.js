const fetch = require('isomorphic-fetch');
const { debug } = require('./utils');

module.exports = (data, options) => {
  const {
    key,
    endpoint,

    branch,
    build,
    buildUrl,
    commit,
    pr,
    slug,

    commitMessage,

    agentVersion,
  } = options;

  const payload = {
    key,
    project: slug,
    job: {
      commit,
      branch,
      prNumber: pr,
      buildNumber: build,
      buildUrl,
      commitMessage,
    },
    rawData: data,
    agentVersion,
  };

  debug('Payload', payload);

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  }).then((res) => res.json())
    .then((response) => {
      debug('Response', response);

      if (response.code) {
        console.error(response);
        return;
      }

      const { info, res } = response;

      if (!res) {
        console.error('Something went wrong', response);
        return;
      }

      console.log(`Job #${res.job.internalBuildNumber} done.`);
      console.log(info.message);
    })
    .catch((err) => console.error(err));
};
