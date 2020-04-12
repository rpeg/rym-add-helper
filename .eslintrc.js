module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    'chrome': true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'import',
  ],
  rules: {
    "react/jsx-filename-extension": [1, { "extensions": [".tsx", ".jsx" ] }],
    "import/no-unresolved": "error",
    "import/extensions": ["error", "ignorePackages", {
      "ts": "never",
      "js": "never",
    }],
    "no-underscore-dangle": "off",
    "no-unused-vars": "off",
    "no-use-before-define": "off",
    "func-names": "off",
    "jsx-a11y/label-has-associated-control": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/no-noninteractive-element-interactions": "off",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      "typescript": {
        "directory": './',
      },
    }
  },
};
