import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";
import rootConfig from "../eslint.config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * ESLint configuration for the web/ package (Next.js app)
 * Extends the root configuration with Next.js specific rules
 */
const eslintConfig = [
  // Start with root config
  ...rootConfig,

  // Add Next.js specific rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Package-specific ignores
  {
    ignores: ["next-env.d.ts"],
  },
];

export default eslintConfig;
