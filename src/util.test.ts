import { describe, expect, test } from "bun:test";
import { extractHostFromDatabaseUrl } from "./util";

describe("extractHostFromDatabaseUrl", () => {
  test("extracts hostname from PostgreSQL URL", () => {
    const url = "postgresql://user:password@db.example.com:5432/database";
    expect(extractHostFromDatabaseUrl(url)).toBe("db.example.com");
  });

  test("extracts hostname from PostgreSQL URL without port", () => {
    const url = "postgresql://user:password@db.example.com/postgres";
    expect(extractHostFromDatabaseUrl(url)).toBe("db.example.com");
  });

  test("extracts hostname from MySQL URL", () => {
    const url = "mysql://user:password@mysql.example.com:3306/app";
    expect(extractHostFromDatabaseUrl(url)).toBe("mysql.example.com");
  });

  test("extracts hostname from localhost URL", () => {
    const url = "postgresql://localhost:5432/main";
    expect(extractHostFromDatabaseUrl(url)).toBe("localhost");
  });

  test("extracts hostname from IP address", () => {
    const url = "postgresql://192.168.1.100:5432/data";
    expect(extractHostFromDatabaseUrl(url)).toBe("192.168.1.100");
  });

  test("extracts hostname from URL with special characters in credentials", () => {
    const url = "postgresql://user%40email.com:p%40ssw0rd@db.example.com/api";
    expect(extractHostFromDatabaseUrl(url)).toBe("db.example.com");
  });

  test("extracts hostname from Neon serverless URL", () => {
    const url =
      "postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/production";
    expect(extractHostFromDatabaseUrl(url)).toBe(
      "ep-cool-darkness-123456.us-east-2.aws.neon.tech"
    );
  });

  test("throws error for invalid URL", () => {
    expect(() => extractHostFromDatabaseUrl("not-a-valid-url")).toThrow();
  });

  test("throws error for empty string", () => {
    expect(() => extractHostFromDatabaseUrl("")).toThrow();
  });
});
