import webpackValidate from '@bundle-stats/plugin-webpack-validate';

import * as LOCALES from '../locales/en';

export function validateWebpackStats(data: any): any {
  const invalidData = webpackValidate(data);

  if (invalidData) {
    throw new Error(LOCALES.VALIDATE_ERROR, { cause: invalidData });
  }
}
