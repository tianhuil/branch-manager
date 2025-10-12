import crypto from "crypto";
import { createDatabase, deleteDatabase, getDatabaseUrl } from "./db";
import { processEnvOrThrow } from "./util";

/**
 * In CI/CD, we need isolated databases for each Git branch, but:
 * - Storing passwords for every branch database doesn't scale
 * - Random passwords need to be persisted somewhere
 * - CI pipelines need to access the same database across different jobs
 *
 * We solve this using a pseudo-random but deterministic password generation
 * algorithm based on a single secret password seed.  This is secure and stateless.
 */
export class PreviewDatabase {
  constructor(public readonly branchName: string) {}

  /**
   * Sanitizes the branch name to contain only valid PostgreSQL identifier characters.
   * Converts all characters that are not [a-zA-Z0-9_] to underscores.
   */
  private get sanitizedBranchName(): string {
    return this.branchName.replace(/[^a-zA-Z0-9_]/g, "_");
  }

  get dbName() {
    return `preview_${this.sanitizedBranchName}`;
  }

  get dbUser() {
    return `preview_${this.sanitizedBranchName}`;
  }

  /**
   * Pseudo-random but deterministic password generation algorithm based on a
   * single fixed password seed.
   * Encoded in base64url to be URL-safe.
   */
  get dbPassword(): string {
    const passwordSeed = processEnvOrThrow("DB_PASSWORD_SEED");
    return crypto
      .pbkdf2Sync(passwordSeed, this.sanitizedBranchName, 1000, 64, "sha512")
      .toString("base64url");
  }

  get dbHost() {
    return processEnvOrThrow("DB_HOST");
  }

  get rootDatabaseUrl() {
    return processEnvOrThrow("ROOT_DATABASE_URL");
  }

  get databaseUrl() {
    return getDatabaseUrl({
      dbName: this.dbName,
      dbUser: this.dbUser,
      dbPassword: this.dbPassword,
      dbHost: this.dbHost,
    });
  }

  async create() {
    await createDatabase({
      dbName: this.dbName,
      dbUser: this.dbUser,
      dbPassword: this.dbPassword,
      rootDatabaseUrl: this.rootDatabaseUrl,
    });
  }

  async delete() {
    await deleteDatabase({
      dbName: this.dbName,
      dbUser: this.dbUser,
      rootDatabaseUrl: this.rootDatabaseUrl,
    });
  }
}
