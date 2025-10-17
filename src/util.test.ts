import { describe, expect, test } from "bun:test";
import { extractHostFromDatabaseUrl, validateOption } from "./util";

describe("extractHostFromDatabaseUrl", () => {
  test.each([
    {
      description: "PostgreSQL URL with port",
      url: "postgresql://user:password@db.example.com:5432/database",
      expected: "db.example.com",
    },
    {
      description: "PostgreSQL URL without port",
      url: "postgresql://user:password@db.example.com/postgres",
      expected: "db.example.com",
    },
    {
      description: "MySQL URL",
      url: "mysql://user:password@mysql.example.com:3306/app",
      expected: "mysql.example.com",
    },
    {
      description: "localhost URL",
      url: "postgresql://localhost:5432/main",
      expected: "localhost",
    },
    {
      description: "IP address",
      url: "postgresql://192.168.1.100:5432/data",
      expected: "192.168.1.100",
    },
    {
      description: "URL with special characters in credentials",
      url: "postgresql://user%40email.com:p%40ssw0rd@db.example.com/api",
      expected: "db.example.com",
    },
    {
      description: "Neon serverless URL",
      url: "postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/production",
      expected: "ep-cool-darkness-123456.us-east-2.aws.neon.tech",
    },
  ])("extracts hostname from $description", ({ url, expected }) => {
    expect(extractHostFromDatabaseUrl(url)).toBe(expected);
  });

  test("throws error for invalid URL", () => {
    expect(() => extractHostFromDatabaseUrl("not-a-valid-url")).toThrow();
  });

  test("throws error for empty string", () => {
    expect(() => extractHostFromDatabaseUrl("")).toThrow();
  });
});

describe("validateOption", () => {
  test("returns first value when it is truthy", () => {
    const result = validateOption("error", "value1", "value2");
    expect(result).toBe("value1");
  });

  test("returns second value when first is undefined", () => {
    const result = validateOption("error", undefined, "value2");
    expect(result).toBe("value2");
  });

  test("returns third value when first two are undefined", () => {
    const result = validateOption("error", undefined, undefined, "value3");
    expect(result).toBe("value3");
  });

  test("returns first non-falsy value when some are empty strings", () => {
    const result = validateOption("error", "", undefined, "value3");
    expect(result).toBe("value3");
  });

  test("throws error with custom message when all values are undefined", () => {
    expect(() =>
      validateOption("Custom error message", undefined, undefined)
    ).toThrow("Custom error message");
  });

  test("throws error when all values are empty strings", () => {
    expect(() => validateOption("No valid value", "", "")).toThrow(
      "No valid value"
    );
  });

  test("throws error when no options provided", () => {
    expect(() => validateOption("No options")).toThrow("No options");
  });
});
