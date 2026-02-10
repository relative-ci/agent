// Incorrect ts-eslint behaviour
// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'tsdown';
import replacePlugin from '@rollup/plugin-replace';

import packageInfo from './package.json' with { type: 'json' };

export default defineConfig({
  entry: {
    index: './src/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  unbundle: true,
  hash: false,
  minify: false,
  sourcemap: false,
  plugins: [
    replacePlugin({
      preventAssignment: true,
      AGENT_VERSION: JSON.stringify(packageInfo.version),
    }),
  ],
});
