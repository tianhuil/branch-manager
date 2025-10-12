import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Get database client
 * @returns neon connector
 */
export const getDB = (databaseUrl?: string) => {
  const url = databaseUrl || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(url);
};

/**
 * Get drizzle database client
 * @returns Drizzle database client instance
 */
export const getDrizzle = (databaseUrl?: string) => {
  const sql = getDB(databaseUrl);
  return drizzle(sql, { schema });
};
