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
    .then(res => console.log('Done', res))
    .catch(err => console.error(err));
};
