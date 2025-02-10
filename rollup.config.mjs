import path from 'node:path';
import { defineConfig } from 'rollup';
import replacePlugin from '@rollup/plugin-replace';
import babelPlugin from '@rollup/plugin-babel';

import packageInfo from './package.json' assert { type: 'json' };

const CONTEXT = path.join(process.cwd(), './src');
const OUTPUT_DIR = 'lib';

export default defineConfig([
  {
    context: CONTEXT,
    input: {
      index: './src/index.js',
      cli: './src/cli.js',
    },
    output: {
      dir: OUTPUT_DIR,
      format: 'commonjs',
      exports: 'named',
      entryFileNames: '[name].js',
      chunkFileNames: '[name].js',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: CONTEXT,
    },
    external: /node_modules/,
    plugins: [
      replacePlugin({
        preventAssignment: true,
        AGENT_VERSION: JSON.stringify(packageInfo.version),
      }),
      babelPlugin({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
      }),
    ],
  },
]);
