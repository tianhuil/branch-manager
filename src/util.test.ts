import { describe, expect, test } from "bun:test";
import { extractPartsFromDatabaseUrl, validateOption } from "./util";

describe("extractPartsFromDatabaseUrl", () => {
  test.each([
    {
      description: "PostgreSQL URL with port",
      url: "postgresql://user:password@db.example.com:5432/database",
      expected: {
        host: "db.example.com",
        user: "user",
        password: "password",
        dbName: "database",
      },
    },
    {
      description: "PostgreSQL URL without port",
      url: "postgresql://abc:def@db.example.com/postgres",
      expected: {
        host: "db.example.com",
        user: "abc",
        password: "def",
        dbName: "postgres",
      },
    },
    {
      description: "MySQL URL",
      url: "mysql://user:password@mysql.example.com:3306/app",
      expected: {
        host: "mysql.example.com",
        user: "user",
        password: "password",
        dbName: "app",
      },
    },
    {
      description: "localhost URL",
      url: "postgresql://localhost:5432/main",
      expected: {
        host: "localhost",
        dbName: "main",
      },
    },
    {
      description: "IP address",
      url: "postgresql://192.168.1.100:5432/data",
      expected: {
        host: "192.168.1.100",
        dbName: "data",
      },
    },
    {
      description: "URL with special characters in credentials",
      url: "postgresql://user%40email.com:p%40ssw0rd@db.example.com/api",
      expected: {
        host: "db.example.com",
        user: "user@email.com",
        password: "p@ssw0rd",
        dbName: "api",
      },
    },
    {
      description: "Neon serverless URL with query params",
      url: "postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/production?sslmode=require",
      expected: {
        host: "ep-cool-darkness-123456.us-east-2.aws.neon.tech",
        user: "user",
        password: "password",
        dbName: "production",
      },
    },
  ])("extracts url parts from $description", ({ url, expected }) => {
    expect(extractPartsFromDatabaseUrl(url)).toEqual(expected);
  });

  test("throws error for invalid URL", () => {
    expect(() => extractPartsFromDatabaseUrl("not-a-valid-url")).toThrow();
  });

  test("throws error for empty string", () => {
    expect(() => extractPartsFromDatabaseUrl("")).toThrow();
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
