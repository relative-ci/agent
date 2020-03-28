const assert = require('assert');
const webpack = require('webpack');
const MemoryFS = require('memory-fs');

const appConfig = require('./webpack/webpack.config');

describe('Webpack', () => {
  it('should return error if RELATIVE_CI_KEY is missing', (done) => {
    process.env.RELATIVE_CI_KEY = '123';
    process.env.RELATIVE_CI_SLUG = 'organization/project';

    const compiler = webpack(appConfig);
    compiler.outputFileSystem = new MemoryFS()

    compiler.run((error, stats) => {
      assert.ok(stats);
      done();
    });

    process.env.RELATIVE_CI_KEY = undefined;
    process.env.RELATIVE_CI_SLUG = undefined;
  });
});
