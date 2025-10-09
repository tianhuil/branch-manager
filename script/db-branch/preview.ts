import crypto from "crypto";
import { createDatabase, deleteDatabase, getDatabaseUrl } from "./db-setup";
import { processEnvOrThrow } from "./util";

export class PreviewDatabase {
  constructor(public readonly branchName: string) {}

  get dbName() {
    return `preview-${this.branchName}`;
  }

  get dbUser() {
    return `preview-${this.branchName}`;
  }

  get dbPassword(): string {
    const passwordSeed = processEnvOrThrow("DB_PASSWORD_SEED");
    return crypto
      .pbkdf2Sync(passwordSeed, this.branchName, 1000, 64, "sha512")
      .toString("base64");
  }

  get dbHost() {
    return processEnvOrThrow("DB_HOST");
  }

  get rootDatabaseUrl() {
    return processEnvOrThrow("ROOT_DATABASE_URL");
  }

  get databaseUrl() {
    return getDatabaseUrl(this);
  }

  async create() {
    await createDatabase(this);
  }

  async delete() {
    await deleteDatabase(this);
  }
}
