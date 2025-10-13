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

beforeAll(() => {
  // Create the tarball
  const packResult = runCommand("bun run pack");
  if (packResult.exitCode !== 0) {
    throw new Error(
      `Failed to pack: ${packResult.stderr.toString() || packResult.stdout.toString()}`
    );
  }

  // Find the tarball in dist/
  const lsResult = runCommand("ls -t dist/neon-prototype-*.tgz | head -1");
  const tarballName = lsResult.stdout.toString().trim();
  tarballPath = join(projectRoot, tarballName);

  console.log(`Using tarball: ${tarballPath}`);
});

describe("Package Installation E2E Tests", () => {
  /**
   * Test installation with bun
   */
  test("bun install works", () => {
    const testDir = join(tmpdir(), `test-install-bun-${Date.now()}`);

    try {
      // Create test directory and initialize
      runCommand(`mkdir -p ${testDir}`);
      const initResult = runCommand("bun init -y", testDir);
      expect(initResult.exitCode).toBe(0);

      // Install the package
      const installResult = runCommand(`bun add ${tarballPath}`, testDir);
      expect(installResult.exitCode).toBe(0);

      // Test that the CLI works
      const cliResult = runCommand("npx bm --help", testDir);
      expect(isBmOutput(cliResult.stdout.toString())).toBe(true);
    } finally {
      // Cleanup
      runCommand(`rm -rf ${testDir}`);
    }
  });

  /**
   * Test installation with npm
   */
  test("npm install works", () => {
    const testDir = join(tmpdir(), `test-install-npm-${Date.now()}`);

    try {
      // Create test directory and initialize
      runCommand(`mkdir -p ${testDir}`);
      const initResult = runCommand("npm init -y", testDir);
      expect(initResult.exitCode).toBe(0);

      // Install the package
      const installResult = runCommand(`npm install ${tarballPath}`, testDir);
      expect(installResult.exitCode).toBe(0);

      // Test that the CLI works
      const cliResult = runCommand("npx bm --help", testDir);
      expect(isBmOutput(cliResult.stdout.toString())).toBe(true);
    } finally {
      // Cleanup
      runCommand(`rm -rf ${testDir}`);
    }
  });

  /**
   * Test installation with yarn
   */
  test("yarn install works", () => {
    const testDir = join(tmpdir(), `test-install-yarn-${Date.now()}`);

    try {
      // Create test directory and initialize
      runCommand(`mkdir -p ${testDir}`);
      const initResult = runCommand("yarn init -y", testDir);
      expect(initResult.exitCode).toBe(0);

      // Install the package
      const installResult = runCommand(`yarn add file:${tarballPath}`, testDir);
      expect(installResult.exitCode).toBe(0);

      // Test that the CLI works
      const cliResult = runCommand("npx bm --help", testDir);
      expect(isBmOutput(cliResult.stdout.toString())).toBe(true);
    } finally {
      // Cleanup
      runCommand(`rm -rf ${testDir}`);
    }
  });

  /**
   * Test installation with pnpm
   */
  test("pnpm install works", () => {
    const testDir = join(tmpdir(), `test-install-pnpm-${Date.now()}`);

    try {
      // Create test directory and initialize
      runCommand(`mkdir -p ${testDir}`);
      const initResult = runCommand("pnpm init", testDir);
      expect(initResult.exitCode).toBe(0);

      // Install the package
      const installResult = runCommand(`pnpm add ${tarballPath}`, testDir);
      expect(installResult.exitCode).toBe(0);

      // Test that the CLI works
      const cliResult = runCommand("npx bm --help", testDir);
      const output = cliResult.stdout.toString();
      expect(isBmOutput(output)).toBe(true);
    } finally {
      // Cleanup
      runCommand(`rm -rf ${testDir}`);
    }
  });
});
