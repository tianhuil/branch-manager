import { neon } from "@neondatabase/serverless";

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
 * Run a command and throw error if it fails
 */
export const extractHostFromDatabaseUrl = (databaseUrl: string): string => {
  const url = new URL(databaseUrl);
  return url.hostname;
};
