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

export default defineConfig([
  {
    context: CONTEXT,
    input: {
      index: './src/index.ts',
      cli: './src/cli.ts',
      artifacts: './src/artifacts/index.ts',
      ingest: './src/ingest/index.ts',
      utils: './src/utils/index.ts',
    },
    output: [
      {
        dir: OUTPUT_DIR,
        format: 'cjs',
        entryFileNames: 'cjs/[name].js',
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: CONTEXT,
        interop: 'auto',
      },
      {
        dir: OUTPUT_DIR,
        format: 'esm',
        entryFileNames: 'esm/[name].js',
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: CONTEXT,
        interop: 'auto',
      },
    ],
    external: /node_modules/,
    plugins: [
      replacePlugin({
        preventAssignment: true,
        AGENT_VERSION: JSON.stringify(packageInfo.version),
      }),
      nodeResolvePlugin(),
      commonjsPlugin(),
      typescriptPlugin(),
    ],
  },
]);
