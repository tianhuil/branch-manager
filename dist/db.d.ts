interface CreateDatabaseParams {
    dbName: string;
    dbUser: string;
    dbPassword: string;
    rootDatabaseUrl: string;
}
export declare const createDatabase: ({ dbName, dbUser, dbPassword, rootDatabaseUrl, }: CreateDatabaseParams) => Promise<void>;
interface DeleteDatabaseParams {
    dbName: string;
    dbUser?: string;
    rootDatabaseUrl: string;
}
export declare const deleteDatabase: ({ dbName, dbUser, rootDatabaseUrl, }: DeleteDatabaseParams) => Promise<void>;
interface GetDatabaseUrlParams {
    dbName: string;
    dbUser: string;
    dbPassword: string;
    dbHost: string;
}
export declare const getDatabaseUrl: ({ dbName, dbUser, dbPassword, dbHost, }: GetDatabaseUrlParams) => string;
export {};
//# sourceMappingURL=db.d.ts.map