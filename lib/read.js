const fs = require('fs-extra');
const {
  get,
  isEmpty,
  set,
  pick,
} = require('lodash');

const SOURCES = [
  {
    key: 'webpack.stats',
    properties: ['assets', 'entrypoints'],
  },
];

// @TODO add logs
module.exports = config => SOURCES.map(({ key, properties }) => {
  const filepath = get(config, key);

  if (!filepath) {
    return null;
  }

  return {
    key,
    properties,
    filepath,
  };
}).filter(item => !isEmpty(item))
  .map(item => ({
    ...item,
    data: pick(
      fs.readJSONSync(item.filepath),
      item.properties,
    ),
  }))
  .reduce((agg, { key, data }) => ({
    ...agg,
    ...set({}, key, data),
  }), {});
