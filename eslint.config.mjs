import jest from 'eslint-plugin-jest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['lib'],
  },
  ...compat.extends('airbnb-base'),
  {
    plugins: {
      jest,
    },
    languageOptions: {
      globals: {
        ...jest.environments.globals.globals,
        AGENT_VERSION: true,
        describe: true,
        it: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['**/*.test.js', '*.config.mjs'],
        },
      ],
    },
  },
];
