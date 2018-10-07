const fetch = require('isomorphic-fetch');
const { debug } = require('./utils');

module.exports.send = (data, options) => {
  const {
    key,
    endpoint,

    commit,
    branch,
    pr,
    build,
    buildUrl,
    slug,
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
    },
    rawData: {
      webpack: {
        stats: data,
      },
    },
    agentVersion,
  };

  debug('Payload', payload);

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  }).then(res => res.json())
    .then(({ info, res }) => {
      console.log(`Job #${res.job.internalBuildNumber} done.`);
      console.log(info.message);
      debug('Response', res);
    })
    .catch(err => console.error(err));
};
