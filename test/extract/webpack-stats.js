const assert = require('assert');

const extract = require('../../lib/extract/webpack-stats');

describe('Extract Webpack stats', () => {
  it('should pick up assets', () => {
    const ACTUAL = {
      assets: [
        {
          name: 'file1.js',
          size: 1,
          chunks: [],
        },
        {
          name: 'file2.js',
          size: 1,
          chunks: [],
        },
        {
          name: 'file1.js.map',
          size: 2,
          chunks: [],
        },
      ],
    };

    const EXPECTED = {
      assets: [
        {
          name: 'file1.js',
          size: 1,
        },
        {
          name: 'file2.js',
          size: 1,
        },
      ],
      entrypoints: {},
      chunks: [],
    };

    assert.deepStrictEqual(extract(ACTUAL), EXPECTED);
  });

  it('should pick up assets with pathIgnorePattern', () => {
    const ACTUAL = {
      assets: [
        {
          name: 'file1.js',
          size: 1,
          chunks: [],
        },
        {
          name: 'file2.js',
          size: 1,
          chunks: [],
        },
        {
          name: 'file1.js.map',
          size: 2,
          chunks: [],
        },
      ],
    };

    const EXPECTED = {
      assets: [
        {
          name: 'file2.js',
          size: 1,
        },
      ],
      entrypoints: {},
      chunks: [],
    };

    assert.deepStrictEqual(extract(ACTUAL, { pathIgnorePattern: 'file1.js(|.map)$' }), EXPECTED);
  });

  it('should pick up entrypoints', () => {
    const ACTUAL = {
      entrypoints: {
        main: {
          assets: [
            'main.js',
            'main.css',
          ],
          chunks: [],
        },
        app: {
          assets: [
            'app.js',
            'app.css',
          ],
          chunks: [],
        },
      },
    };

    const EXPECTED = {
      assets: [],
      entrypoints: {
        main: {
          assets: [
            'main.js',
            'main.css',
          ],
        },
        app: {
          assets: [
            'app.js',
            'app.css',
          ],
        },
      },
      chunks: [],
    };

    assert.deepStrictEqual(extract(ACTUAL), EXPECTED);
  });

  it('should pick up chunks', () => {
    const ACTUAL = {
      chunks: [
        {
          entry: true,
          initial: true,
          id: 0,
          files: [
            'file1.js',
            'file1.js.map',
          ],
          names: [
            'file1',
          ],
          size: 0,
        },
      ],
    };

    const EXPECTED = {
      assets: [],
      entrypoints: {},
      chunks: [
        {
          entry: true,
          initial: true,
          id: 0,
          files: [
            'file1.js',
            'file1.js.map',
          ],
          names: [
            'file1',
          ],
        },
      ],
    };

    assert.deepStrictEqual(extract(ACTUAL), EXPECTED);
  });
});
