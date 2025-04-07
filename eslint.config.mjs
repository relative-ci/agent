import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
// Eslint fails to resolve the package
// eslint-disable-next-line
import tseslint from 'typescript-eslint';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends('airbnb-base'),
  {
    ignores: ['test/webpack/**/dist'],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['**/*.test.js', '**/*.config.{js,mjs}'],
        },
      ],
      'import/no-unresolved': [
        'error',
        {
          ignore: ['@relative-ci/'],
        },
      ],
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js'],
        },
      },
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      'import/extensions': ['error', 'never', { ts: 'never' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['**/*.test.ts', '**/*.config.ts'],
        },
      ],
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },
  },
  {
    files: [
      'config/*.js',
      '**/*.test.js',
      'test/utils.js',
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
