import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  // Enforce architectural boundaries - db-branch module must be self-contained
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    ignores: ["**/*.test.*", "**/*.spec.*", "**/*.e2e.*"],
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/include": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
      "boundaries/ignore": ["**/*.test.*", "**/*.spec.*", "**/*.e2e.*"],
      "boundaries/elements": [
        {
          type: "db-branch",
          pattern: "script/db-branch/**",
        },
        {
          type: "app",
          pattern: ["app/**", "lib/**", "script/**"],
        },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: ["db-branch"],
              disallow: ["app"],
              message:
                "db-branch module must be self-contained and cannot import from other parts of the repo",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
