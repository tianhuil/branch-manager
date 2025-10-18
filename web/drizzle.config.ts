import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: (() => {
    if (process.env.DATABASE_URL) {
      return { url: process.env.DATABASE_URL };
    }
    console.warn(
      "DATABASE_URL is not set. You won't be able to run migrate, push and pull commands."
    );
  })(),
});
