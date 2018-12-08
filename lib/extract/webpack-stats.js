const {
  flow,
  fromPairs,
  get,
  map,
  filter,
  pick,
  toPairs,
} = require('lodash/fp');

const { debug } = require('../utils');

const EXCLUDE = '.map$';

module.exports = (source, options = {}) => {
  const exclude = new RegExp(options.exclude || EXCLUDE);

  debug('Extract assets, entrypoints from the webpack stats');

  const assets = flow(
    get('assets'),
    map(pick(['name', 'size'])),
    filter(({ name }) => !exclude.test(name)),
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
