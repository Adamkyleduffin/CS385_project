// ESLint config: Expo's recommended rules + Prettier.
// Prettier formatting problems show up as ESLint errors.
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'android/*', 'ios/*'],
  },
  {
    // The app must never import server-side code: supabase/functions holds code that uses
    // secret API keys (e.g. Climatiq), and anything bundled into the app can be extracted.
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/supabase/functions/**'],
              message: 'Server-only code (secret keys). Call it through Supabase instead.',
            },
          ],
        },
      ],
    },
  },
]);
