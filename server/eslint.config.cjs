const js = require('@eslint/js');
const pluginRegexp = require('eslint-plugin-regexp');

module.exports = [
  js.configs.recommended,

  // Apply Node environment settings only to your backend files
  {
    files: ['**/*.js', '**/*.jsx'], // or narrow down if you want
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',  // since you use CommonJS
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly'
      }
    },
    // enable Node-specific rules here, or plugins, or override rules
  },

  {
    plugins: {
      regexp: pluginRegexp,
    },
    rules: {
      ...pluginRegexp.configs['recommended'].rules
    }
  }
];
