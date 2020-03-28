jest.mock('isomorphic-fetch');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');
const fetch = require('isomorphic-fetch');

const appConfig = require('./webpack/webpack.config');


describe('webpack-plugin', () => {
  test('should send data to the service', (done) => {
    process.env.CI = 'true';
    process.env.RELATIVE_CI_ENDPOINT = 'http://localhost/save';
    process.env.RELATIVE_CI_KEY = '123';
    process.env.RELATIVE_CI_SLUG = 'organization/project';

    fetch.mockReturnValue(Promise.resolve({
      json: () => Promise.resolve({
        res: {
          job: {
            internalBuildNumber: 1,
          },
        },
        info: {
          message: {
            txt: 'Hello world!',
          },
        },
      }),
    }));

    const compiler = webpack(appConfig);
    compiler.outputFileSystem = new MemoryFS();

    compiler.run((error, stats) => {
      expect(error).toEqual(null);
      expect(stats.hasErrors()).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1);

      process.env.CI = undefined;
      process.env.RELATIVE_CI_ENDPOINT = undefined;
      process.env.RELATIVE_CI_KEY = undefined;
      process.env.RELATIVE_CI_SLUG = undefined;
      done();
    });
  });
});
