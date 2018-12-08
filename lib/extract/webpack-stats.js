const {
  flow,
  fromPairs,
  get,
  map,
  pick,
  toPairs,
} = require('lodash/fp');

const { debug } = require('../utils');

module.exports = (source) => {
  debug('Extract assets, entrypoints from the webpack stats');

  const assets = flow(
    get('assets'),
    map(pick(['name', 'size'])),
  )(source);

  const entrypoints = flow(
    get('entrypoints'),
    toPairs,
    map(([key, value]) => [
      key,
      pick('assets')(value),
    ]),
    fromPairs,
  )(source);

  return {
    assets,
    entrypoints,
  };
};
