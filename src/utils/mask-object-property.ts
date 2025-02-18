import merge from 'lodash/merge';
import set from 'lodash/set';
import get from 'lodash/get';

import { MASK } from '../constants';

function maskValue(value: unknown): string {
  if (!value || !value?.toString) {
    return MASK;
  }

  const text = value.toString();
  return `${MASK}${text.substring(text.length - 6)}`;
}

export function maskObjectProperties(data: Record<string, unknown>, paths: Array<string>): unknown {
  const normalizedData = merge({}, data);

  paths.forEach((propertyPath) => {
    const value = get(normalizedData, propertyPath, '');

    set(normalizedData, propertyPath, maskValue(value));
  });

  return normalizedData;
}
