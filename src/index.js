const fs = require('fs-extra');
const { get, omit, set } = require('lodash');

const { debug } = require('./utils');
const { extractWebpackStats } = require('./extract');
const send = require('./send');

const WEBPACK_STATS = 'webpack.stats';

const SOURCE_EXTRACTORS = {
  [WEBPACK_STATS]: extractWebpackStats,
};

const getConfiguredArtifacts = (config) => Object.keys(SOURCE_EXTRACTORS)
  .map((key) => {
    const artifactConfig = get(config, key);

    if (!artifactConfig) {
      return null;
    }

    if (typeof artifactConfig === 'object') {
      return {
        key,
        filepath: artifactConfig.filepath,
        options: omit(artifactConfig, 'filepath'),
      };
    }

    return {
      key,
      filepath: artifactConfig,
    };
  })
  .filter((item) => item);

const getDataFromArtifacts = async (artifacts) => Promise.all(
  artifacts.map(async ({ key, filepath, options }) => {
    debug('Read artifact', filepath);

    const data = await fs.readJSON(filepath);

    return {
      key,
      data,
      options,
    };
  }),
);

const getFilteredData = (artifactsData) => artifactsData.reduce(
  (agg, { key, data, options }) => set(agg, key, SOURCE_EXTRACTORS[key](data, options)),
  {},
);

module.exports = async ({ config, params }) => {
  const artifacts = getConfiguredArtifacts(config);
  const artifactsData = await getDataFromArtifacts(artifacts);
  const filteredData = getFilteredData(artifactsData);

  return send(filteredData, params);
};
