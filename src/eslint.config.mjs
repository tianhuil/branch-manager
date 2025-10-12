import rootConfig from "../eslint.config.mjs";

/**
 * ESLint configuration for the src/ package (@db-branch/core)
 * Extends the root configuration with package-specific rules
 */
export default [
  ...rootConfig,

  // Package-specific ignores
  {
    ignores: ["**/*.e2e.ts"],
  },

  // Package-specific rules
  {
    files: ["**/*.ts"],
    rules: {
      // Add any src-specific rules here
    },
  },
];
