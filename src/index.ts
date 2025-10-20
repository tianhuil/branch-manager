#!/usr/bin/env node
import { Command } from "commander";
import { createDatabase, deleteDatabase, getDatabaseUrl } from "./db";
import {
  createPreviewDatabase,
  deletePreviewDatabase,
  getPreviewDatabaseUrl,
} from "./preview";
import {
  extractHostFromDatabaseUrl,
  getCurrentGitBranch,
  validateOption,
} from "./util";
import prompts from "prompts";

const program = new Command();

program
  .name("Branch Manager")
  .description("CLI for managing database branches and preview databases")
  .version("1.0.0");

// ============================================================================
// Field Validation Functions
// ============================================================================

/**
 * Validates and retrieves the database name from options or environment
 */
const getDbName = (options: { dbName?: string }): string =>
  validateOption(
    "Missing required parameter: dbName (provide via --db-name or DB_NAME env var)",
    options.dbName,
    process.env.DB_NAME
  );

/**
 * Validates and retrieves the database user from options or environment
 */
const getDbUser = (options: { dbUser?: string }): string =>
  validateOption(
    "Missing required parameter: dbUser (provide via --db-user or DB_USER env var)",
    options.dbUser,
    process.env.DB_USER
  );

/**
 * Retrieves the optional database user from options or environment
 */
const getDbUserOptional = (options: { dbUser?: string }): string | undefined =>
  options.dbUser || process.env.DB_USER;

/**
 * Validates and retrieves the database password from options or environment
 */
const getDbPassword = (options: { dbPassword?: string }): string =>
  validateOption(
    "Missing required parameter: dbPassword (provide via --db-password or DB_PASSWORD env var)",
    options.dbPassword,
    process.env.DB_PASSWORD
  );

/**
 * Validates and retrieves the root database URL from options or environment
 */
const getRootDatabaseUrl = (options: { rootDatabaseUrl?: string }): string =>
  validateOption(
    "Missing required parameter: rootDatabaseUrl (provide via --root-database-url or ROOT_DATABASE_URL env var)",
    options.rootDatabaseUrl,
    process.env.ROOT_DATABASE_URL
  );

/**
 * Validates and retrieves the database host from options, environment, or root URL
 */
const getDbHost = (options: { dbHost?: string }): string =>
  validateOption(
    "Missing required parameter: dbHost (provide via --db-host or DB_HOST env var or ROOT_DATABASE_URL env var)",
    options.dbHost,
    process.env.DB_HOST,
    process.env.ROOT_DATABASE_URL
      ? extractHostFromDatabaseUrl(process.env.ROOT_DATABASE_URL)
      : undefined
  );

/**
 * Validates and retrieves the branch name from options, environment, or git
 */
const getBranchName = (options: { branchName?: string }): string =>
  validateOption(
    "Missing branch name (provide via --branch-name option, BRANCH_NAME env var, or run in a git repository)",
    options.branchName,
    process.env.BRANCH_NAME,
    getCurrentGitBranch()
  );

/**
 * Validates and retrieves the database password seed from options or environment
 */
const getDbPasswordSeed = (options: { dbPasswordSeed?: string }): string =>
  validateOption(
    "Missing required parameter: dbPasswordSeed (provide via --db-password-seed or DB_PASSWORD_SEED env var)",
    options.dbPasswordSeed,
    process.env.DB_PASSWORD_SEED
  );

// ============================================================================
// DB Command
// ============================================================================

const dbCommand = program
  .command("db")
  .description("Manage databases directly");

/**
 * Parameters for db create command
 */
interface DbCreateOptions {
  dbName?: string;
  dbUser?: string;
  dbPassword?: string;
  rootDatabaseUrl?: string;
}

dbCommand
  .command("create")
  .description("Create a new database with user and privileges")
  .option("--db-name <name>", "Database name (overrides DB_NAME env var)")
  .option("--db-user <user>", "Database user (overrides DB_USER env var)")
  .option(
    "--db-password <password>",
    "Database password (overrides DB_PASSWORD env var)"
  )
  .option(
    "--root-database-url <url>",
    "Root database URL (overrides ROOT_DATABASE_URL env var)"
  )
  .action(async (options: DbCreateOptions) => {
    await createDatabase({
      dbName: getDbName(options),
      dbUser: getDbUser(options),
      dbPassword: getDbPassword(options),
      rootDatabaseUrl: getRootDatabaseUrl(options),
    });
  });

/**
 * Parameters for db delete command
 */
interface DbDeleteOptions {
  dbName?: string;
  dbUser?: string;
  rootDatabaseUrl?: string;
  yes?: boolean;
}

dbCommand
  .command("delete")
  .description("Delete a database and optionally its user")
  .option("--db-name <name>", "Database name (overrides DB_NAME env var)")
  .option(
    "--db-user <user>",
    "Database user to delete (overrides DB_USER env var, optional)"
  )
  .option(
    "--root-database-url <url>",
    "Root database URL (overrides ROOT_DATABASE_URL env var)"
  )
  .option("-y, --yes", "Skip confirmation")
  .action(async (options: DbDeleteOptions) => {
    const args = {
      dbName: getDbName(options),
      dbUser: getDbUserOptional(options),
      rootDatabaseUrl: getRootDatabaseUrl(options),
    };

    if (!options.yes) {
      const { confirm } = await prompts({
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to delete the database ${options.dbName}?`,
        initial: false,
      });
      if (!confirm) {
        process.exit(1);
      }
    }

    await deleteDatabase(args);
  });

/**
 * Parameters for db url command
 */
interface DbUrlOptions {
  dbName?: string;
  dbUser?: string;
  dbPassword?: string;
  dbHost?: string;
}

dbCommand
  .command("url")
  .description("Get the database connection URL")
  .option("--db-name <name>", "Database name (overrides DB_NAME env var)")
  .option("--db-user <user>", "Database user (overrides DB_USER env var)")
  .option(
    "--db-password <password>",
    "Database password (overrides DB_PASSWORD env var)"
  )
  .option("--db-host <host>", "Database host (overrides DB_HOST env var)")
  .action((options: DbUrlOptions) => {
    const url = getDatabaseUrl({
      dbName: getDbName(options),
      dbUser: getDbUser(options),
      dbPassword: getDbPassword(options),
      dbHost: getDbHost(options),
    });
    console.log(url);
  });

// ============================================================================
// Preview Command
// ============================================================================

const previewCommand = program
  .command("preview")
  .description("Manage preview databases for branches");

/**
 * Parameters for preview create command
 */
interface PreviewCreateOptions {
  branchName?: string;
  dbPasswordSeed?: string;
  rootDatabaseUrl?: string;
}

previewCommand
  .command("create")
  .description("Create a preview database for a branch")
  .option(
    "--branch-name <name>",
    "Branch name (overrides BRANCH_NAME env var, defaults to current git branch)"
  )
  .option(
    "--db-password-seed <seed>",
    "Password seed (overrides DB_PASSWORD_SEED env var)"
  )
  .option(
    "--root-database-url <url>",
    "Root database URL (overrides ROOT_DATABASE_URL env var)"
  )
  .action(async (options: PreviewCreateOptions) => {
    await createPreviewDatabase({
      branchName: getBranchName(options),
      dbPasswordSeed: getDbPasswordSeed(options),
      rootDatabaseUrl: getRootDatabaseUrl(options),
    });
  });

/**
 * Parameters for preview delete command
 */
interface PreviewDeleteOptions {
  branchName?: string;
  rootDatabaseUrl?: string;
}

previewCommand
  .command("delete")
  .description("Delete a preview database for a branch")
  .option(
    "--branch-name <name>",
    "Branch name (overrides BRANCH_NAME env var, defaults to current git branch)"
  )
  .option(
    "--root-database-url <url>",
    "Root database URL (overrides ROOT_DATABASE_URL env var)"
  )
  .action(async (options: PreviewDeleteOptions) => {
    await deletePreviewDatabase({
      branchName: getBranchName(options),
      rootDatabaseUrl: getRootDatabaseUrl(options),
    });
  });

/**
 * Parameters for preview url command
 */
interface PreviewUrlOptions {
  branchName?: string;
  dbPasswordSeed?: string;
  dbHost?: string;
}

previewCommand
  .command("url")
  .description("Get the database connection URL for a preview database")
  .requiredOption(
    "--branch-name <name>",
    "Branch name (overrides BRANCH_NAME env var, defaults to current git branch)"
  )
  .option(
    "--db-password-seed <seed>",
    "Password seed (overrides DB_PASSWORD_SEED env var)"
  )
  .option("--db-host <host>", "Database host (overrides DB_HOST env var)")
  .action((options: PreviewUrlOptions) => {
    const url = getPreviewDatabaseUrl({
      branchName: getBranchName(options),
      dbPasswordSeed: getDbPasswordSeed(options),
      dbHost: getDbHost(options),
    });
    console.log(url);
  });

// Parse arguments
program.parse();
