// eslint-disable-next-line import/no-relative-packages
import configs from '../../eslint.config.mjs';

export default [
  ...configs,
  {
    ignores: ['lib'],
  },
];
