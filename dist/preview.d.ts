export declare class PreviewDatabase {
    readonly branchName: string;
    constructor(branchName: string);
    private get sanitizedBranchName();
    get dbName(): string;
    get dbUser(): string;
    get dbPassword(): string;
    get dbHost(): string;
    get rootDatabaseUrl(): string;
    get databaseUrl(): string;
    create(): Promise<void>;
    delete(): Promise<void>;
}
//# sourceMappingURL=preview.d.ts.map