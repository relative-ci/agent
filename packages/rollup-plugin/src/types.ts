import type { OutputOptions as RollupOutputOptions, Plugin as RollupPlugin } from 'rollup';
import type { Plugin as VitePlugin } from 'vite';

export type Plugin = VitePlugin & RollupPlugin;
export type OutputOptions = RollupOutputOptions;
