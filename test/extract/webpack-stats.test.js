const extract = require('../../lib/extract/webpack-stats');

describe('Extract Webpack stats', () => {
  test('should pick up assets', () => {
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
      modules: [],
    };

    expect(extract(ACTUAL)).toEqual(EXPECTED);
  });

  test('should pick up assets with pathIgnorePattern', () => {
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
      modules: [],
    };

    expect(extract(ACTUAL, { pathIgnorePattern: 'file1.js(|.map)$' })).toEqual(EXPECTED);
  });

  test('should pick up entrypoints', () => {
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
      modules: [],
    };

    expect(extract(ACTUAL)).toEqual(EXPECTED);
  });

  test('should pick up chunks', () => {
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
      modules: [],
    };

    expect(extract(ACTUAL)).toEqual(EXPECTED);
  });

  test('should pick up modules', () => {
    const ACTUAL = {
      modules: [
        {
          name: 'node_modules/react/index.js',
          size: 1,
          chunks: [0],
          index: 1,
          index2: 2,
        },
      ],
    };

    const EXPECTED = {
      assets: [],
      entrypoints: {},
      chunks: [],
      modules: [
        {
          name: 'node_modules/react/index.js',
          size: 1,
          chunks: [0],
        },
      ],
    };

    expect(extract(ACTUAL)).toEqual(EXPECTED);
  });
});
