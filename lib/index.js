const fs = require('fs-extra');
const { get, set } = require('lodash');

const { debug } = require('./utils');
const { extractWebpackStats } = require('./extract');
const send = require('./send');

const WEBPACK_STATS = 'webpack.stats';

const SOURCE_EXTRACTORS = {
  [WEBPACK_STATS]: extractWebpackStats,
};

const getConfiguredArtifacts = config => Object.keys(SOURCE_EXTRACTORS)
  .map(key => ({
    key,
    filepath: get(config, key),
  }))
  .filter(item => item.filepath);

const getDataFromArtifacts = async artifacts => Promise.all(
  artifacts.map(async ({ key, filepath }) => {
    debug('Read artifact', filepath);

    const data = await fs.readJSON(filepath);

    return {
      key,
      data,
    };
  }),
);

const getFilteredData = artifactsData => artifactsData.reduce(
  (agg, { key, data }) => set(agg, key, SOURCE_EXTRACTORS[key](data)),
  {},
);

module.exports = async ({ config, params }) => {
  const artifacts = getConfiguredArtifacts(config);
  const artifactsData = await getDataFromArtifacts(artifacts);
  const filteredData = getFilteredData(artifactsData);

  return send(filteredData, params);
};
