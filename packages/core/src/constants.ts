export const DEFAULT_ENDPOINT = 'https://api.relative-ci.com/save';

export const MASK = '******';

export const SOURCE_WEBPACK_STATS = 'webpack.stats';
export type Source = typeof SOURCE_WEBPACK_STATS;
export type SourceFilterFn = (data: any) => any;

export type EnvVars = {
  /**
   * true whent it runs in a CI environment
   */
  isCi: boolean;
  /**
   * RelativeCI project API key
   */
  key: string;
  /**
   * RelativeCI ingest endpoint
   */
  endpoint: string;
  /**
   * Project repository slug
   * @example facebook/react
   */
  slug?: string;
  /**
   * CI service
   */
  service?: string;
  /**
   * Branch name
   */
  branch?: string;
  /**
   * Commit SHA
   */
  commit?: string;
  /**
   * Pull request number
   */
  pr?: string;
  /**
   * Build id
   */
  build?: string;
  /**
   * Build URL
   */
  buildUrl?: string;
  /**
   * Commit message
   */
  commitMessage?: string;
};

export type PluginArgs = {
  slug?: EnvVars['slug'];
  branch?: EnvVars['slug'];
  pr?: EnvVars['pr'];
  commit?: EnvVars['commit'];
  build?: EnvVars['build'];
  buildUrl?: EnvVars['buildUrl'];
  commitMessage?: EnvVars['commitMessage'];
};

export type PluginConfig = {
  /**
   * Absolute path for debug payload filepath
   * Default: `undefined`.
   */
  payloadFilepath?: string;
  /**
   * Read commit message from the git logs or GitHub Action event data
   * Default: `true`.
   */
  includeCommitMessage?: boolean;
};

export type IngestParams = {
  key: EnvVars['key'];
  endpoint: EnvVars['endpoint'];
  slug: EnvVars['slug'];
  service?: EnvVars['service'];
  branch: EnvVars['branch'];
  commit: EnvVars['commit'];
  pr?: EnvVars['pr'];
  build?: EnvVars['build'];
  buildUrl?: EnvVars['buildUrl'];
  commitMessage?: EnvVars['commitMessage'];
  /**
   * RelativeCI agent version
   */
  agentVersion: string;
};

export type IngestConfig = {
  payloadFilepath?: PluginConfig['payloadFilepath'];
};

export type IngestData = Record<string, unknown>;

export type IngestResponseError = {
  code: string;
  message: string;
};

export type IngestResponseSuccess = {
  reportUrl?: string;
  res?: {
    job?: {
      internalBuildNumber?: string;
    };
  };
  info?: {
    message?: {
      txt?: string;
    }
  };
}

export type IngestResponse = IngestResponseError & IngestResponseSuccess;
