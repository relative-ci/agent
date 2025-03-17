import path from 'node:path';
import { defineConfig } from 'rollup';
import commonjsPlugin from '@rollup/plugin-commonjs';
import nodeResolvePlugin from '@rollup/plugin-node-resolve';
import replacePlugin from '@rollup/plugin-replace';
import typescriptPlugin from '@rollup/plugin-typescript';

// @ts-expect-error Incorrect ts-eslint tsconfig
import packageInfo from './package.json' with { type: 'json' };

const CONTEXT = path.join(process.cwd(), './src');
const OUTPUT_DIR = 'lib';
const INPUT = {
  index: './src/index.ts',
  cli: './src/cli.ts',
  artifacts: './src/artifacts/index.ts',
  ingest: './src/ingest/index.ts',
  utils: './src/utils/index.ts',
};

/**
 * Explicit depenency externals to bundle by default esm only dependencies
 * - env-ci
 */
const EXTERNAL = [
  // Dependencies
  '@bundle-stats/plugin-webpack-filter',
  '@bundle-stats/plugin-webpack-validate',
  'core-js',
  'cosmiconfig',
  'debug',
  'dotenv',
  'fs-extra',
  'lodash',
  'yargs',
  // Peer dependencies
  'webpack',
];

export default defineConfig([
  {
    context: CONTEXT,
    input: INPUT,
    output: {
      dir: OUTPUT_DIR,
      format: 'cjs',
      entryFileNames: 'cjs/[name].js',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: CONTEXT,
      interop: 'auto',
    },
    external: EXTERNAL,
    plugins: [
      replacePlugin({
        preventAssignment: true,
        AGENT_VERSION: JSON.stringify(packageInfo.version),
      }),
      nodeResolvePlugin({
        extensions: ['.js', '.cjs', '.json'],
      }),
      commonjsPlugin({
        defaultIsModuleExports: 'auto',
        requireReturnsDefault: 'auto',
        transformMixedEsModules: false,
      }),
      typescriptPlugin({
        tsconfig: './tsconfig.cjs.json',
      }),
    ],
  },
  {
    context: CONTEXT,
    input: INPUT,
    output: {
      dir: OUTPUT_DIR,
      format: 'esm',
      entryFileNames: 'esm/[name].js',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: CONTEXT,
      interop: 'auto',
    },
    external: EXTERNAL,
    plugins: [
      replacePlugin({
        preventAssignment: true,
        AGENT_VERSION: JSON.stringify(packageInfo.version),
      }),
      nodeResolvePlugin({
        extensions: ['.js', '.mjs', '.cjs', '.json'],
      }),
      commonjsPlugin({
        defaultIsModuleExports: 'auto',
        requireReturnsDefault: 'auto',
        transformMixedEsModules: true,
      }),
      typescriptPlugin({
        tsconfig: './tsconfig.esm.json',
      }),
    ],
  },
]);
