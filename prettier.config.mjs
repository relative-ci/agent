export default {
  arrowParens: 'always',
  printWidth: 100,
  trailingComma: 'all',
  singleQuote: true,
  overrides: [
    {
      files: '**/*.yml',
      options: {
        singleQuote: false,
      },
    },
  ],
};
