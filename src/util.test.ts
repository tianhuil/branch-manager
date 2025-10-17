import { describe, expect, test } from "bun:test";
import { extractHostFromDatabaseUrl } from "./util";

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
