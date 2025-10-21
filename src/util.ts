import { neon } from "@neondatabase/serverless";
import { execSync } from "child_process";

/**
 * Get database client
 * @param databaseUrl - Optional database URL, defaults to DATABASE_URL env var
 * @returns neon connector
 */
export const getDB = (databaseUrl?: string) => {
  const url = databaseUrl || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(url);
};

/**
 * Get environment variable or throw error if not set
 * @param key - Environment variable key
 * @returns Environment variable value
 */
export const processEnvOrThrow = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not set`);
  }
  return value;
};

/**
 * Validates that at least one of the provided options is truthy
 * @param error - Error message to throw if validation fails
 * @param options - Variable number of option values to check (first truthy value wins)
 * @returns The first truthy string value from the options
 * @throws Error with the provided error message if all values are falsy
 */
export const validateOption = (
  error: string,
  ...options: (string | undefined)[]
): string => {
  const value = options.reduce(
    (acc, curr) => acc || curr,
    undefined as string | undefined
  );
  if (!value) {
    throw new Error(error);
  }
  return value;
};

/**
 * Get the current git branch name
 * @returns The current git branch name or undefined if not in a git repository
 */
export const getCurrentGitBranch = (): string | undefined => {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
    }).trim();
  } catch {
    return undefined;
  }
};
