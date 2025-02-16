export const DEFAULT_ENDPOINT = 'https://api.relative-ci.com/save';

export const MASK = '******';

export type IngestParams = {
  /**
   * RelativeCI project API key
   */
  key: string;
  /**
   * RelativeCI ingest endpoint
   */
  endpoint: string;
  /**
   * RelativeCI agent version
   */
  agentVersion: string;
  /**
   * Project slug, eg: facebook/react
   */
  slug: string;
  /**
   * CI service
   */
  service?: string;
  /**
   * Commit branch
   */
  branch: string;
  /**
   * Commit SHA
   */
  commit: string;
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

export type IngestConfig = {
  payloadFilepath?: string;
}

export type EnvVars = {
  /**
   * true whent it runs in a CI environment
   */
  isCi: boolean;
  /**
   * CI service
   */
  service?: string;
  /**
   * Commit branch
   */
  branch?: string;
  /**
   * Commit SHA
   */
  commit?: string;
  /**
   * Project slug, eg: facebook/react
   */
  slug?: string;
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
  /**
   * RelativeCI project API key
   */
  key: string;
  /**
   * RelativeCI ingest endpoint
   */
  endpoint: string;
};

export type AgentArgs = {
  slug?: string;
  branch?: string;
  prBranch?: string;
  pr?: string;
  commit?: string;
  build?: string;
  buildUrl?: string;
  commitMessage?: string;
}

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
