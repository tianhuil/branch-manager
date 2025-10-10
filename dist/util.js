import { neon } from "@neondatabase/serverless";
export const getDB = (databaseUrl) => {
    const url = databaseUrl || process.env.DATABASE_URL;
    if (!url) {
        throw new Error("DATABASE_URL is not set");
    }
    return neon(url);
};
export const processEnvOrThrow = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`${key} is not set`);
    }
    return value;
};
//# sourceMappingURL=util.js.map