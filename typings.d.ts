export interface AgentConfig {
  /**
   * Read commit message from the repo
   * Default: `true`.
   */
  includeCommitMessage?: boolean;

  /**
   * Absolute path for debug payload filepath
   * Default: `undefined`.
   */
  payloadFilepath?: string;
}

export interface AgentArgs {
  slug?: string;
  branch?: string;
  prBranch?: string;
  pr?: string;
  commit?: string;
  build?: string;
  buildUrl?: string;
  commitMessage?: string;
}

export interface EnvCI {
  isCi: boolean;
  branch?: string;
  build?: string;
  buildUrl?: string;
  commit?: string;
  pr?: string;
  prBranch?: string;
  service?: string;
  slug?: string;
}

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

  interface Options extends AgentConfig {
    /**
     * Send webpack stats to RelativeCI
     * Default: `env-ci` `isCi` value
     */
    enabled?: boolean;

    stats?: Partial<WebpackStatsOptions>
  }

  type Compiler = import('webpack').Compiler;
}
