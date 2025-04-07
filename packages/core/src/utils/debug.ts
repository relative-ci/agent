import getDebug from 'debug';

const DEBUG_NAME = 'relative-ci:agent';

let debugLoggler;

export function debug(...args: Array<unknown>) {
  if (!debugLoggler) {
    debugLoggler = getDebug(DEBUG_NAME);
  }

  debugLoggler(...args);
}
