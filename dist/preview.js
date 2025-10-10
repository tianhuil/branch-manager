import crypto from "crypto";
import { createDatabase, deleteDatabase, getDatabaseUrl } from "./db";
import { processEnvOrThrow } from "./util";
export class PreviewDatabase {
    constructor(branchName) {
        this.branchName = branchName;
    }
    get sanitizedBranchName() {
        return this.branchName.replace(/[^a-zA-Z0-9_]/g, "_");
    }
    get dbName() {
        return `preview_${this.sanitizedBranchName}`;
    }
    get dbUser() {
        return `preview_${this.sanitizedBranchName}`;
    }
    get dbPassword() {
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
//# sourceMappingURL=preview.js.map