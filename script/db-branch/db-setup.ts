import { createLogger } from "./logger";
import { getDB } from "./util";

const logger = createLogger("db-setup");

/**
 * Parameters for database setup
 */
interface CreateDatabaseParams {
  dbName: string;
  dbUser: string;
  dbPassword: string;
  rootDatabaseUrl: string;
}

/**
 * Set up a PostgreSQL database by creating a user and database with appropriate privileges.
 *
 * @param params - Database setup parameters
 */
export const createDatabase = async ({
  dbName,
  dbUser,
  dbPassword,
  rootDatabaseUrl,
}: CreateDatabaseParams) => {
  // Connect to the root database with logging disabled
  const sql = getDB(rootDatabaseUrl);

  logger.info({ dbName, dbUser }, "Setting up database");

  logger.info("Terminating existing connections...");
  await sql`
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = ${dbName}
      AND pid <> pg_backend_pid()
  `;

  logger.info("Dropping existing database if it exists...");
  // Note: We need to use raw SQL for DROP DATABASE as it doesn't support parameters
  await sql.query(`DROP DATABASE IF EXISTS ${dbName}`);

  logger.info("Dropping existing user if it exists...");
  await sql.query(`DROP USER IF EXISTS ${dbUser}`);

  logger.info("Creating user...");
  await sql.query(
    `CREATE USER ${dbUser} WITH PASSWORD '${dbPassword.replace(/'/g, "''")}'`,
  );

  logger.info("Creating database...");
  await sql.query(`CREATE DATABASE ${dbName}`);

  logger.info("Granting database privileges...");
  await sql.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser}`);

  logger.info("Granting schema privileges...");
  const dbSql = getDB(rootDatabaseUrl.replace(/\/[^/]*$/, `/${dbName}`));

  await dbSql.query(`GRANT USAGE ON SCHEMA public TO ${dbUser}`);
  await dbSql.query(`GRANT CREATE ON SCHEMA public TO ${dbUser}`);

  logger.info({ dbName, dbUser }, "Database setup completed successfully!");
};

/**
 * Parameters for database deletion
 */
interface DeleteDatabaseParams {
  dbName: string;
  dbUser?: string;
  rootDatabaseUrl: string;
}

/**
 * Delete a PostgreSQL database and optionally its associated user.
 *
 * @param params - Database deletion parameters
 */
export const deleteDatabase = async ({
  dbName,
  dbUser,
  rootDatabaseUrl,
}: DeleteDatabaseParams) => {
  // Connect to the root database with logging disabled
  const sql = getDB(rootDatabaseUrl);

  logger.info({ dbName, dbUser }, "Deleting database");

  logger.info("Terminating existing connections...");
  await sql`
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

/**
 * Parameters for database setup
 */
interface GetDatabaseUrlParams {
  dbName: string;
  dbUser: string;
  dbPassword: string;
  dbHost: string;
}

export const getDatabaseUrl = ({
  dbName,
  dbUser,
  dbPassword,
  dbHost,
}: GetDatabaseUrlParams) => {
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}/${dbName}?sslmode=require&channel_binding=require`;
};
