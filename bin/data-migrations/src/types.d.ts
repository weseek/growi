export type MigrationModule = (body: string) => string;
export type ReplaceLatestRevisions = (body: string, migrationModules: MigrationModule[]) => string;
