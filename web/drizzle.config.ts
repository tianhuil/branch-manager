import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: (() => {
      if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
      }
      throw new Error("DATABASE_URL is not set");
    })(),
  },
});
