import crypto from "crypto";
import { createDatabase, deleteDatabase, getDatabaseUrl } from "./db";

/**
 * In CI/CD, we need isolated databases for each Git branch, but:
 * - Storing passwords for every branch database doesn't scale
 * - Random passwords need to be persisted somewhere
 * - CI pipelines need to access the same database across different jobs
 *
 * We solve this using a pseudo-random but deterministic password generation
 * algorithm based on a single secret password seed.  This is secure and stateless.
 */

export interface PreviewParams {
  branchName: string;
  dbPasswordSeed: string;
}

export interface CreatePreviewDatabaseParams extends PreviewParams {
  rootDatabaseUrl: string;
}

export interface DeletePreviewDatabaseParams {
  branchName: string;
  rootDatabaseUrl: string;
}

export interface GetPreviewDatabaseUrlParams extends PreviewParams {
  dbHost: string;
}

/**
 * Sanitizes the branch name to contain only valid PostgreSQL identifier characters.
 * Converts all characters that are not [a-zA-Z0-9_] to underscores.
 */
function sanitizeBranchName(branchName: string): string {
  return branchName.replace(/[^a-zA-Z0-9_]/g, "_");
}

/**
 * Gets the database name for a preview database.
 */
function getPreviewDbName(branchName: string): string {
  const sanitized = sanitizeBranchName(branchName);
  return `preview_${sanitized}`;
}

/**
 * Gets the database user for a preview database.
 */
function getPreviewDbUser(branchName: string): string {
  const sanitized = sanitizeBranchName(branchName);
  return `preview_${sanitized}`;
}

/**
 * Pseudo-random but deterministic password generation algorithm based on a
 * single fixed password seed.
 * Encoded in base64url to be URL-safe.
 */
function getPreviewDbPassword({
  branchName,
  dbPasswordSeed,
}: PreviewParams): string {
  const sanitized = sanitizeBranchName(branchName);
  return crypto
    .pbkdf2Sync(dbPasswordSeed, sanitized, 1000, 64, "sha512")
    .toString("base64url");
}

/**
 * Gets the database URL for a preview database.
 */
export function getPreviewDatabaseUrl({
  branchName,
  dbPasswordSeed,
  dbHost,
}: GetPreviewDatabaseUrlParams): string {
  return getDatabaseUrl({
    dbName: getPreviewDbName(branchName),
    dbUser: getPreviewDbUser(branchName),
    dbPassword: getPreviewDbPassword({ branchName, dbPasswordSeed }),
    dbHost,
  });
}

/**
 * Creates a preview database for a given branch.
 */
export async function createPreviewDatabase({
  branchName,
  dbPasswordSeed,
  rootDatabaseUrl,
}: CreatePreviewDatabaseParams): Promise<void> {
  await createDatabase({
    dbName: getPreviewDbName(branchName),
    dbUser: getPreviewDbUser(branchName),
    dbPassword: getPreviewDbPassword({ branchName, dbPasswordSeed }),
    rootDatabaseUrl,
  });
}

/**
 * Deletes a preview database for a given branch.
 */
export async function deletePreviewDatabase({
  branchName,
  rootDatabaseUrl,
}: DeletePreviewDatabaseParams): Promise<void> {
  await deleteDatabase({
    dbName: getPreviewDbName(branchName),
    dbUser: getPreviewDbUser(branchName),
    rootDatabaseUrl,
  });
}
