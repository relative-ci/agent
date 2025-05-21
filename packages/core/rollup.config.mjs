import path from 'node:path';
import { defineConfig } from 'rollup';
import commonjsPlugin from '@rollup/plugin-commonjs';
import nodeResolvePlugin from '@rollup/plugin-node-resolve';
import replacePlugin from '@rollup/plugin-replace';
import typescriptPlugin from '@rollup/plugin-typescript';
// eslint is not able to resolve the dependency
// eslint-disable-next-line import/no-unresolved
import nodeExternals from 'rollup-plugin-node-externals';

// @ts-expect-error Incorrect ts-eslint tsconfig
import packageInfo from './package.json' with { type: 'json' };

const CONTEXT = path.join(process.cwd(), './src');
const OUTPUT_DIR = 'lib';
const INPUT = {
  index: './src/index.ts',
  env: './src/env/index.ts',
  artifacts: './src/artifacts/index.ts',
  ingest: './src/ingest/index.ts',
  utils: './src/utils/index.ts',
  'locales/en': './src/locales/en.ts',
};

/**
 * @param {string} prefix
 */
function getEntryFileNames(prefix) {
  /**
   * @type {import('rollup').PreRenderedChunk}
   * @return {string}
   */
  return function entryFileNames(fileInfo) {
    let name = '[name]';

    /**
     * Replace `node_modules` with `__`
     * In node 18-20, type=commonjs is automatically inferred for modules
     * under a node_modules folder without a package.json with type
     */
    if (fileInfo.name.match(/node_modules/)) {
      name = fileInfo.name.replace(/node_modules/g, '__');
    }

    return `${prefix}/${name}.js`;
  };
}

export default defineConfig([
  {
    context: CONTEXT,
    input: INPUT,
    output: {
      dir: OUTPUT_DIR,
      format: 'cjs',
      entryFileNames: getEntryFileNames('cjs'),
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: CONTEXT,
      interop: 'auto',
    },
    plugins: [
      replacePlugin({
        preventAssignment: true,
        AGENT_VERSION: JSON.stringify(packageInfo.version),
      }),
      nodeExternals({
        deps: true,
        peerDeps: true,
      }),
      nodeResolvePlugin({
        extensions: ['.js', '.cjs', '.json'],
      }),
      commonjsPlugin(),
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
      entryFileNames: getEntryFileNames('esm'),
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: CONTEXT,
      interop: 'auto',
    },
    plugins: [
      replacePlugin({
        preventAssignment: true,
        AGENT_VERSION: JSON.stringify(packageInfo.version),
      }),
      nodeExternals({
        deps: true,
        peerDeps: true,
      }),
      nodeResolvePlugin({
        extensions: ['.js', '.mjs', '.cjs', '.json'],
      }),
      commonjsPlugin(),
      typescriptPlugin({
        tsconfig: './tsconfig.esm.json',
      }),
    ],
  },
]);
