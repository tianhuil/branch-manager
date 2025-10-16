import rootConfig from "../eslint.config.mjs";

/**
 * ESLint configuration for the src/ package (@tianhuil/branch-manager)
 * Extends the root configuration with package-specific rules
 */
export default [
  ...rootConfig,

  // Package-specific ignores
  {
    ignores: [],
  },

  // Package-specific rules
  {
    files: ["**/*.ts"],
    rules: {
      // Add any src-specific rules here
    },
  },
];
