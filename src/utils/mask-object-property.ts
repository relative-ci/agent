import _ from 'lodash';

import { MASK } from '../constants';

function maskValue(value: unknown): string {
  if (!value || !value?.toString) {
    return MASK;
  }

  const text = value.toString();
  return `${MASK}${text.substring(text.length - 6)}`;
}

export function maskObjectProperties(data: Record<string, unknown>, paths: Array<string>): unknown {
  const normalizedData = _.merge({}, data);

  paths.forEach((propertyPath) => {
    const value = _.get(normalizedData, propertyPath, '');

    _.set(normalizedData, propertyPath, maskValue(value));
  });

  return normalizedData;
}
