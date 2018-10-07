const fetch = require('isomorphic-fetch');

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
  } = options;

  const job = {
    commit,
    branch,
    prNumber: pr,
    buildNumber: build,
    buildUrl,
  };

  const rawData = {
    webpack: {
      stats: data,
    },
  };

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      key,
      job,
      project: slug,
      rawData,
    }),
  }).then(res => res.json())
    .then(({ info, res }) => {
      console.log(`Job #${res.job.internalBuildNumber} done.`);
      console.log(info.message);
    })
    .catch(err => console.error(err));
};
