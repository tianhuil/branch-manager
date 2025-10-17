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

const program = new Command();

program
  .name("Branch Manager")
  .description("CLI for managing database branches and preview databases")
  .version("1.0.0");

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
    const dbName = validateOption(
      "Missing required parameter: dbName (provide via --db-name or DB_NAME env var)",
      options.dbName,
      process.env.DB_NAME
    );
    const dbUser = validateOption(
      "Missing required parameter: dbUser (provide via --db-user or DB_USER env var)",
      options.dbUser,
      process.env.DB_USER
    );
    const dbPassword = validateOption(
      "Missing required parameter: dbPassword (provide via --db-password or DB_PASSWORD env var)",
      options.dbPassword,
      process.env.DB_PASSWORD
    );
    const rootDatabaseUrl = validateOption(
      "Missing required parameter: rootDatabaseUrl (provide via --root-database-url or ROOT_DATABASE_URL env var)",
      options.rootDatabaseUrl,
      process.env.ROOT_DATABASE_URL
    );

    await createDatabase({
      dbName,
      dbUser,
      dbPassword,
      rootDatabaseUrl,
    });
  });

/**
 * Parameters for db delete command
 */
interface DbDeleteOptions {
  dbName?: string;
  dbUser?: string;
  rootDatabaseUrl?: string;
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
  .action(async (options: DbDeleteOptions) => {
    const dbName = validateOption(
      "Missing required parameter: dbName (provide via --db-name or DB_NAME env var)",
      options.dbName,
      process.env.DB_NAME
    );
    const rootDatabaseUrl = validateOption(
      "Missing required parameter: rootDatabaseUrl (provide via --root-database-url or ROOT_DATABASE_URL env var)",
      options.rootDatabaseUrl,
      process.env.ROOT_DATABASE_URL
    );
    const dbUser = options.dbUser || process.env.DB_USER;

    await deleteDatabase({
      dbName,
      dbUser,
      rootDatabaseUrl,
    });
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
    const dbName = validateOption(
      "Missing required parameter: dbName (provide via --db-name or DB_NAME env var)",
      options.dbName,
      process.env.DB_NAME
    );
    const dbUser = validateOption(
      "Missing required parameter: dbUser (provide via --db-user or DB_USER env var)",
      options.dbUser,
      process.env.DB_USER
    );
    const dbPassword = validateOption(
      "Missing required parameter: dbPassword (provide via --db-password or DB_PASSWORD env var)",
      options.dbPassword,
      process.env.DB_PASSWORD
    );
    const dbHost = validateOption(
      "Missing required parameter: dbHost (provide via --db-host or DB_HOST env var or ROOT_DATABASE_URL env var)",
      options.dbHost,
      process.env.DB_HOST,
      process.env.ROOT_DATABASE_URL
        ? extractHostFromDatabaseUrl(process.env.ROOT_DATABASE_URL)
        : undefined
    );

    const url = getDatabaseUrl({
      dbName,
      dbUser,
      dbPassword,
      dbHost,
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
    const branchName = validateOption(
      "Missing branch name (provide via --branch-name option, BRANCH_NAME env var, or run in a git repository)",
      options.branchName,
      process.env.BRANCH_NAME,
      getCurrentGitBranch()
    );

    const dbPasswordSeed = validateOption(
      "Missing required parameter: dbPasswordSeed (provide via --db-password-seed or DB_PASSWORD_SEED env var)",
      options.dbPasswordSeed,
      process.env.DB_PASSWORD_SEED
    );

    const rootDatabaseUrl = validateOption(
      "Missing required parameter: rootDatabaseUrl (provide via --root-database-url or ROOT_DATABASE_URL env var)",
      options.rootDatabaseUrl,
      process.env.ROOT_DATABASE_URL
    );

    await createPreviewDatabase({
      branchName,
      dbPasswordSeed,
      rootDatabaseUrl,
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
    const branchName = validateOption(
      "Missing branch name (provide via --branch-name option, BRANCH_NAME env var, or run in a git repository)",
      options.branchName,
      process.env.BRANCH_NAME,
      getCurrentGitBranch()
    );

    const rootDatabaseUrl = validateOption(
      "Missing required parameter: rootDatabaseUrl (provide via --root-database-url or ROOT_DATABASE_URL env var)",
      options.rootDatabaseUrl,
      process.env.ROOT_DATABASE_URL
    );

    await deletePreviewDatabase({ branchName, rootDatabaseUrl });
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
    const branchName = validateOption(
      "Missing branch name (provide via --branch-name option)",
      options.branchName
    );

    const dbPasswordSeed = validateOption(
      "Missing required parameter: dbPasswordSeed (provide via --db-password-seed or DB_PASSWORD_SEED env var)",
      options.dbPasswordSeed,
      process.env.DB_PASSWORD_SEED
    );

    const dbHost = validateOption(
      "Missing required parameter: dbHost (provide via --db-host or DB_HOST env var or ROOT_DATABASE_URL env var)",
      options.dbHost,
      process.env.DB_HOST,
      process.env.ROOT_DATABASE_URL
        ? extractHostFromDatabaseUrl(process.env.ROOT_DATABASE_URL)
        : undefined
    );

    const url = getPreviewDatabaseUrl({ branchName, dbPasswordSeed, dbHost });
    console.log(url);
  });

// Parse arguments
program.parse();
