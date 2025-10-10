import { createLogger } from "./logger";
import { getDB } from "./util";
const logger = createLogger("db-setup");
export const createDatabase = async ({ dbName, dbUser, dbPassword, rootDatabaseUrl, }) => {
    var _a, _b;
    const sql = getDB(rootDatabaseUrl);
    logger.info({ dbName, dbUser }, "Setting up database");
    logger.info("Checking if user exists...");
    const userExists = await sql `
    SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname = ${dbUser}) as exists
  `;
    if (!((_a = userExists[0]) === null || _a === void 0 ? void 0 : _a.exists)) {
        logger.info("Creating user...");
        await sql.query(`CREATE USER ${dbUser} WITH PASSWORD '${dbPassword.replace(/'/g, "''")}'`);
    }
    else {
        logger.info("User already exists, skipping user creation");
    }
    logger.info("Checking if database exists...");
    const dbExists = await sql `
    SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = ${dbName}) as exists
  `;
    if (!((_b = dbExists[0]) === null || _b === void 0 ? void 0 : _b.exists)) {
        logger.info("Creating database...");
        await sql.query(`CREATE DATABASE ${dbName}`);
    }
    else {
        logger.info("Database already exists, skipping database creation");
    }
    logger.info("Granting database privileges...");
    await sql.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser}`);
    logger.info("Granting schema privileges...");
    const dbSql = getDB(rootDatabaseUrl.replace(/\/[^/]*$/, `/${dbName}`));
    await dbSql.query(`GRANT USAGE ON SCHEMA public TO ${dbUser}`);
    await dbSql.query(`GRANT CREATE ON SCHEMA public TO ${dbUser}`);
    logger.info({ dbName, dbUser }, "Database setup completed successfully!");
};
export const deleteDatabase = async ({ dbName, dbUser, rootDatabaseUrl, }) => {
    const sql = getDB(rootDatabaseUrl);
    logger.info({ dbName, dbUser }, "Deleting database");
    logger.info("Terminating existing connections...");
    await sql `
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = ${dbName}
      AND pid <> pg_backend_pid()
  `;
    logger.info("Dropping database...");
    await sql.query(`DROP DATABASE IF EXISTS ${dbName}`);
    if (dbUser) {
        logger.info({ dbUser }, "Dropping user");
        await sql.query(`DROP USER IF EXISTS ${dbUser}`);
    }
    logger.info({ dbName, dbUser }, "Database deletion completed successfully!");
};
export const getDatabaseUrl = ({ dbName, dbUser, dbPassword, dbHost, }) => {
    return `postgresql://${dbUser}:${dbPassword}@${dbHost}/${dbName}?sslmode=require&channel_binding=require`;
};
//# sourceMappingURL=db.js.map