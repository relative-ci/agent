import set from 'lodash/set';
import filter from '@bundle-stats/plugin-webpack-filter';

import {
  type IngestData,
  type Source,
  type SourceFilterFn,
  SOURCE_WEBPACK_STATS,
} from '../constants';

const SOURCE_FILTERS: Record<Source, SourceFilterFn> = {
  [SOURCE_WEBPACK_STATS]: filter,
} as const;

type Artifact = {
  key: string;
  data: unknown;
}

/**
 * Filter artifact data based on the source type and map them by key
 */
export function filterArtifacts(artifactsData: Array<Artifact>): IngestData {
  const dataByKey = {};

  artifactsData.forEach(({ key, data }) => {
    set(
      dataByKey,
      key,
      SOURCE_FILTERS[key as Source](data),
    );
  });

  return dataByKey;
}
