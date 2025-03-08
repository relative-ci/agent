import jest from 'eslint-plugin-jest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
// Eslint fails to resolve the package
// eslint-disable-next-line
import tseslint from 'typescript-eslint';

// @ts-expect-error ts-eslint doesn't pick up correctly the tscoonfig options
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
    ignores: ['lib', 'test/webpack/**/dist'],
  },
  {
    plugins: { jest },
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
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      'import/extensions': ['error', 'never', { ts: 'never' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.mjs', '.ts'],
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
