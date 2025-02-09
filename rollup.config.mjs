import path from 'node:path';
import { defineConfig } from 'rollup';
import jsonPlugin from '@rollup/plugin-json';
import babelPlugin from '@rollup/plugin-babel';

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
      jsonPlugin(),
      babelPlugin({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
      }),
    ],
  },
]);
