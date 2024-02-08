module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@stylistic', '@typescript-eslint', 'node', 'prettier'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@stylistic/ban-ts-comment': 'off',
    '@stylistic/quotes': ['warn', 'single', { avoidEscape: true }],
    '@stylistic/no-explicit-any': 'off',
    '@stylistic/no-unsafe-assignment': 'off',
    '@stylistic/no-use-before-define': 'off',
    '@stylistic/no-var-requires': 'off',
    'node/no-empty-function': 'off',
    'node/no-missing-import': 'off',
    'node/no-missing-require': 'off',
    'node/no-unpublished-import': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'node/shebang': 'off',
    'prettier/prettier': 'warn',
  },
};
