export class RelativeCiAgentWebpackPlugin {
  constructor(options?: Partial<RelativeCiAgentWebpackPlugin.Options>) {}

  apply(compiler: RelativeCiAgentWebpackPlugin.Compiler): void;
};

declare namespace RelativeCiAgentWebpackPlugin {
  interface WebpackStatsOptions {
    /**
     * Output webpack assets information
     * Default: `true`.
     */
    assets?: Boolean;

    /**
     * Output webpack chunks information
     * Default: `true`.
     */
    chunks?: Boolean;

    /**
     * Output webpack modules information
     * Default: `true`.
     */
    modules?: Boolean;
  }

  interface Options {
    /**
     * Read commit message from the repo
     * Default: `true`.
     */
    includeCommitMessage?: Boolean;

    /**
     * Absolute path for debug payload filepath
     * Default: `undefined`.
     */
    payloadFilepath?: string;

    stats?: Partial<WebpackStatsOptions>
  }

  type Compiler = import('webpack').Compiler;
}
