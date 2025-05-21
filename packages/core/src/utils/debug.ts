import getDebug from 'debug';

export const AGENT_DEBUG_NAME = 'relative-ci:agent';

let debugLoggler;

export function debug(...args: Array<unknown>) {
  if (!debugLoggler) {
    debugLoggler = getDebug(AGENT_DEBUG_NAME);
  }

  debugLoggler(...args);
}
