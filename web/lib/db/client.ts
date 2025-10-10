import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Get database client
 * @param databaseUrl - Optional database URL, defaults to DATABASE_URL env var
 * @returns drizzle client
 */
export const getDB = (databaseUrl?: string) => {
  const url = databaseUrl || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
};

/**
 * Get Drizzle ORM client (alias for getDB)
 * @param databaseUrl - Optional database URL, defaults to DATABASE_URL env var
 * @returns drizzle client
 */
export const getDrizzle = getDB;

export const db = getDB();
