import { spawnSync } from "bun";
import { beforeAll, describe, expect, test } from "bun:test";
import { tmpdir } from "os";
import { join } from "path";

/**
 * E2E tests for package installation across different package managers
 */

const projectRoot = join(import.meta.dir, "..");
let tarballPath: string;

/**
 * Run a shell command and return the result
 */
const runCommand = (
  command: string,
  cwd: string = projectRoot
): Bun.SyncSubprocess<"pipe", "pipe"> => {
  return spawnSync({
    cmd: ["bash", "-c", command],
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
};

/**
 * Check if output is from the Branch Manager CLI
 */
const isBmOutput = (output: string): boolean => {
  return (
    output.startsWith("Usage: Branch Manager [options] [command]") &&
    output.includes(
      "CLI for managing database branches and preview databases"
    ) &&
    output.includes("Options:") &&
    output.includes("Commands:")
  );
};

/**
 * Package manager configuration for tests
 */
interface PackageManagerConfig {
  name: string;
  initCommand: string;
  installCommand: (tarballPath: string) => string;
}

/**
 * Package managers to test
 */
const packageManagers: PackageManagerConfig[] = [
  {
    name: "bun",
    initCommand: "bun init -y",
    installCommand: (tarballPath: string) => `bun add ${tarballPath}`,
  },
  {
    name: "npm",
    initCommand: "npm init -y",
    installCommand: (tarballPath: string) => `npm install ${tarballPath}`,
  },
  {
    name: "yarn",
    initCommand: "yarn init -y",
    installCommand: (tarballPath: string) => `yarn add file:${tarballPath}`,
  },
  {
    name: "pnpm",
    initCommand: "pnpm init",
    installCommand: (tarballPath: string) => `pnpm add ${tarballPath}`,
  },
];

beforeAll(() => {
  // Create the tarball
  const packResult = runCommand("bun run pack");
  if (packResult.exitCode !== 0) {
    throw new Error(
      `Failed to pack: ${packResult.stderr.toString() || packResult.stdout.toString()}`
    );
  }

  // Find the tarball in pack/
  const lsResult = runCommand("ls -t pack/branch-manager-*.tgz | head -1");
  const tarballName = lsResult.stdout.toString().trim();
  tarballPath = join(projectRoot, tarballName);

  console.log(`Using tarball: ${tarballPath}`);
});

describe("Package Installation E2E Tests", () => {
  test.each(packageManagers)(
    "$name install works",
    ({ name, initCommand, installCommand }) => {
      const testDir = join(tmpdir(), `test-install-${name}-${Date.now()}`);

      try {
        // Create test directory and initialize
        runCommand(`mkdir -p ${testDir}`);
        const initResult = runCommand(initCommand, testDir);
        expect(initResult.exitCode).toBe(0);

        // Install the package
        const installResult = runCommand(installCommand(tarballPath), testDir);
        expect(installResult.exitCode).toBe(0);

        // Test that the CLI works
        const cliResult = runCommand("npx bm --help", testDir);
        const output = cliResult.stdout.toString();
        expect(isBmOutput(output)).toBe(true);
      } finally {
        // Cleanup
        runCommand(`rm -rf ${testDir}`);
      }
    }
  );
});
