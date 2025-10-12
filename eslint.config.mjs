import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Shared ESLint configuration for the monorepo
 * This provides base TypeScript linting rules that all packages can extend
 */
export default tseslint.config(
  // Base recommended configs
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Global settings
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },

  // Global ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/out/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/coverage/**",
      "**/*.min.js",
      "**/*.e2e.ts",
      "**/next-env.d.ts",
      "script/**",
    ],
  },

  // Shared rules for all TypeScript files
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
        },
      ],
    },
  }
);
