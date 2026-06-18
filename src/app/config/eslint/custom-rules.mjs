import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

/**
 * react eslint-plugin-react
 * @type {import('eslint').Linter.RulesRecord}
 * @see https://github.com/jsx-eslint/eslint-plugin-react
 */
export const reactRules = {
  ...react.configs.recommended.rules,
  "react/react-in-jsx-scope": "off",
  "react/no-unknown-property": ["error", { ignore: ["css"] }],
  "react/jsx-sort-props": [
    "error",
    { callbacksLast: true, noSortAlphabetically: false },
  ],
  "react/jsx-handler-names": [
    "error",
    {
      eventHandlerPrefix: "handle",
      eventHandlerPropPrefix: "on",
      checkLocalVariables: true,
      checkInlineFunction: false,
    },
  ],
};

/**
 * react-hooks eslint-plugin-react-hooks
 * @type {import('eslint').Linter.RulesRecord}
 * @see https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
 */
export const reactHooksRules = {
  ...reactHooks.configs.recommended.rules,
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",
};

/**
 * react-refresh eslint-plugin-react-refresh
 * @type {import('eslint').Linter.RulesRecord}
 * @see https://github.com/ArnaudBarre/eslint-plugin-react-refresh
 */
export const reactRefreshRules = {
  ...reactRefresh.configs.recommended.rules,
  "react-refresh/only-export-components": [
    "warn",
    { allowConstantExport: true },
  ],
};

/**
 * eslint-plugin-unused-imports
 * @type {import('eslint').Linter.RulesRecord}
 * @see https://github.com/sweepline/eslint-plugin-unused-imports
 */
export const unusedImportsRules = {
  "@typescript-eslint/no-unused-vars": "off",
  "unused-imports/no-unused-imports": "error",
  "unused-imports/no-unused-vars": [
    "warn",
    {
      vars: "all",
      varsIgnorePattern: "^_",
      args: "after-used",
      argsIgnorePattern: "^_",
    },
  ],
};

/**
 * @typescript-eslint/eslint-plugin
 * @type {import('eslint').Linter.RulesRecord}
 * @see https://github.com/typescript-eslint/typescript-eslint
 */
export const typescriptRules = {
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/explicit-module-boundary-types": "off",
  "@typescript-eslint/array-type": ["error", { default: "array" }],
  "@typescript-eslint/consistent-type-imports": "error",
  "@typescript-eslint/no-namespace": "off",
  "@typescript-eslint/sort-type-constituents": [
    "error",
    {
      groupOrder: [
        "keyword",
        "named",
        "literal",
        "tuple",
        "object",
        "operator",
        "function",
        "nullish",
      ],
    },
  ],
};

// Backward compatibility: default export with all rules combined
export default {
  ...reactRules,
  ...reactHooksRules,
  ...reactRefreshRules,
  ...unusedImportsRules,
  ...typescriptRules,
};
