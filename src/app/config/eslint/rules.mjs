// Named exports for flat config
export {
  reactRules,
  reactHooksRules,
  reactRefreshRules,
  unusedImportsRules,
  typescriptRules,
} from "./custom-rules.mjs";
export { default as fsdRules } from "./fsd-rules.mjs";

// Default export for backward compatibility
import {
  reactRules,
  reactHooksRules,
  reactRefreshRules,
  unusedImportsRules,
  typescriptRules,
} from "./custom-rules.mjs";
import fsdRulesDefault from "./fsd-rules.mjs";

export default {
  ...reactRules,
  ...reactHooksRules,
  ...reactRefreshRules,
  ...unusedImportsRules,
  ...typescriptRules,
  ...fsdRulesDefault,
};
