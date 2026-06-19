import js from "@eslint/js";
import globals from "globals";

import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import importPlugin from "eslint-plugin-import";
import prettierConfig from "eslint-config-prettier";
import storybook from "eslint-plugin-storybook";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import {
  reactRules,
  reactHooksRules,
  reactRefreshRules,
  unusedImportRules,
  typescriptRules,
} from "./src/app/config/eslint/rules.mjs";
import fsdRelativeImportsRules from "./src/app/config/eslint/fsd-relative-imports.mjs";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "build",
      "out",
      ".history",
      ".react-router",
      ".lintstagedrc.cjs",
      "public/mockServiceWorker.js",
    ],
  },
  {
    files: ["**/*.{ts,tsx,mts}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "import/no-relative-parent-imports": "off",
      "fsd/relative-imports": "error",
      ...typescriptRules,
    },
  },
  {
    files: ["**/*.{tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactRules,
      ...reactHooksRules,
      ...reactRefreshRules,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.{ts,tsx,mts}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
      import: importPlugin,
      fsd: fsdRelativeImportsRules,
    },
    rules: {
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      ...unusedImportRules,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
  },
  {
    files: ["**/*.{ts,tsx,mts}"],
    extends: [sonarjs.configs.recommended],
    rules: {
      "sonarjs/no-commented-code": "off",
      "sonarjs/todo-tag": "off",
      "sonarjs/slow-regex": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx,mts}"],
    extends: [unicorn.configs.recommended],
    plugins: {
      unicorn,
    },
    rules: {
      "unicorn/import-style": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/consistent-function-scoping": "off",
      "unicorn/no-null": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/filename-case": [
        "error",
        {
          cases: { kebabCase: true, pascalCase: true, camelCase: true },
          ignore: ["GAProvider.tsx"],
        },
      ],
      "unicorn/prevent-abbreviations": [
        "error",
        {
          allowList: {
            Args: true,
            acc: true,
            cur: true,
            Props: true,
            props: true,
            Fn: true,
            req: true,
            res: true,
            ref: true,
            env: true,
            Env: true,
            args: true,
            i: true,
            e: true,
            Param: true,
            Params: true,
            val: true,
          },
          checkFilenames: false,
          extendDefaultReplacements: false,
        },
      ],
    },
  },
  {
    files: ["**/*.stories.{ts,tsx}"],
    extends: [storybook.configs["flat/recommended"]],
  },
  prettierConfig,
);
