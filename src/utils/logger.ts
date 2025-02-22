/**
 * Basic logger that needs to share the same api
 * with `console` and plugin loggers(eg: WebpackLogger)
 */
export const logger = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
};
