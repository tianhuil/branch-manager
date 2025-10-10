#!/usr/bin/env bun
import { execSync } from "child_process";
import { Command } from "commander";
import { createDatabase, deleteDatabase, getDatabaseUrl } from "./db";
import { createLogger } from "./logger";
import { PreviewDatabase } from "./preview";

const logger = createLogger("db-branch");

const program = new Command();

program
  .name("db-branch")
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
    try {
      const dbName = validateOption(
        options.dbName,
        process.env.DB_NAME,
        "Missing required parameter: dbName (provide via --db-name or DB_NAME env var)"
      );
      const dbUser = validateOption(
        options.dbUser,
        process.env.DB_USER,
        "Missing required parameter: dbUser (provide via --db-user or DB_USER env var)"
      );
      const dbPassword = validateOption(
        options.dbPassword,
        process.env.DB_PASSWORD,
        "Missing required parameter: dbPassword (provide via --db-password or DB_PASSWORD env var)"
      );
      const rootDatabaseUrl = validateOption(
        options.rootDatabaseUrl,
        process.env.ROOT_DATABASE_URL,
        "Missing required parameter: rootDatabaseUrl (provide via --root-database-url or ROOT_DATABASE_URL env var)"
      );

      await createDatabase({
        dbName,
        dbUser,
        dbPassword,
        rootDatabaseUrl,
      });
    } catch (error) {
      logger.error({ error }, "Failed to create database");
      process.exit(1);
    }
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
    try {
      const dbName = validateOption(
        options.dbName,
        process.env.DB_NAME,
        "Missing required parameter: dbName (provide via --db-name or DB_NAME env var)"
      );
      const rootDatabaseUrl = validateOption(
        options.rootDatabaseUrl,
        process.env.ROOT_DATABASE_URL,
        "Missing required parameter: rootDatabaseUrl (provide via --root-database-url or ROOT_DATABASE_URL env var)"
      );
      const dbUser = options.dbUser || process.env.DB_USER;

      await deleteDatabase({
        dbName,
        dbUser,
        rootDatabaseUrl,
      });
    } catch (error) {
      logger.error({ error }, "Failed to delete database");
      process.exit(1);
    }
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
    try {
      const dbName = validateOption(
        options.dbName,
        process.env.DB_NAME,
        "Missing required parameter: dbName (provide via --db-name or DB_NAME env var)"
      );
      const dbUser = validateOption(
        options.dbUser,
        process.env.DB_USER,
        "Missing required parameter: dbUser (provide via --db-user or DB_USER env var)"
      );
      const dbPassword = validateOption(
        options.dbPassword,
        process.env.DB_PASSWORD,
        "Missing required parameter: dbPassword (provide via --db-password or DB_PASSWORD env var)"
      );
      const dbHost = validateOption(
        options.dbHost,
        process.env.DB_HOST,
        "Missing required parameter: dbHost (provide via --db-host or DB_HOST env var)"
      );

      console.log({ dbName, dbUser, dbPassword, dbHost });

      const url = getDatabaseUrl({
        dbName,
        dbUser,
        dbPassword,
        dbHost,
      });
      console.log(url);
    } catch (error) {
      logger.error({ error }, "Failed to get database URL");
      process.exit(1);
    }
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
    try {
      // Set environment variables from options if provided
      if (options.dbPasswordSeed) {
        process.env.DB_PASSWORD_SEED = options.dbPasswordSeed;
      }
      if (options.rootDatabaseUrl) {
        process.env.ROOT_DATABASE_URL = options.rootDatabaseUrl;
      }

      const branchName = validateOption(
        options.branchName || process.env.BRANCH_NAME,
        getCurrentGitBranch(),
        "Missing branch name (provide via --branch-name option, BRANCH_NAME env var, or run in a git repository)"
      );

      const preview = new PreviewDatabase(branchName);
      await preview.create();
    } catch (error) {
      logger.error({ error }, "Failed to create preview database");
      process.exit(1);
    }
  });

/**
 * Parameters for preview delete command
 */
interface PreviewDeleteOptions {
  branchName?: string;
  dbPasswordSeed?: string;
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
    "--db-password-seed <seed>",
    "Password seed (overrides DB_PASSWORD_SEED env var)"
  )
  .option(
    "--root-database-url <url>",
    "Root database URL (overrides ROOT_DATABASE_URL env var)"
  )
  .action(async (options: PreviewDeleteOptions) => {
    try {
      // Set environment variables from options if provided
      if (options.dbPasswordSeed) {
        process.env.DB_PASSWORD_SEED = options.dbPasswordSeed;
      }
      if (options.rootDatabaseUrl) {
        process.env.ROOT_DATABASE_URL = options.rootDatabaseUrl;
      }

      const branchName = validateOption(
        options.branchName || process.env.BRANCH_NAME,
        getCurrentGitBranch(),
        "Missing branch name (provide via --branch-name option, BRANCH_NAME env var, or run in a git repository)"
      );

      const preview = new PreviewDatabase(branchName);
      await preview.delete();
    } catch (error) {
      logger.error({ error }, "Failed to delete preview database");
      process.exit(1);
    }
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
    try {
      // Set environment variables from options if provided
      if (options.dbPasswordSeed) {
        process.env.DB_PASSWORD_SEED = options.dbPasswordSeed;
      }
      if (options.dbHost) {
        process.env.DB_HOST = options.dbHost;
      }
      if (!options.branchName) {
        throw new Error(
          "Missing branch name (provide via --branch-name option)"
        );
      }

      const preview = new PreviewDatabase(options.branchName);
      console.log(preview.databaseUrl);
    } catch (error) {
      logger.error({ error }, "Failed to get preview database URL");
      process.exit(1);
    }
  });

// ============================================================================
// Utilities
// ============================================================================

/**
 * Validates that either the option or processEnv is provided
 * @param option - CLI option value
 * @param processEnv - Environment variable value
 * @param error - Error message to throw if validation fails
 * @returns The validated string value (option takes precedence over processEnv)
 * @throws Error with the provided error message if both values are undefined
 */
const validateOption = (
  option: string | undefined,
  processEnv: string | undefined,
  error: string
): string => {
  const value = option || processEnv;
  if (!value) {
    throw new Error(error);
  }
  return value;
};

/**
 * Get the current git branch name
 * @returns The current git branch name or undefined if not in a git repository
 */
const getCurrentGitBranch = (): string | undefined => {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
    }).trim();
  } catch {
    return undefined;
  }
};

// Parse arguments
program.parse();
