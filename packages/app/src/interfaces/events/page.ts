export const PageEventName = {
  // Public migration
  PMStarted: 'PublicMigrationStarted',
  PMMigrating: 'PublicMigrationMigrating',
  PMErrorCount: 'PublicMigrationErrorCount',
  PMEnded: 'PublicMigrationEnded',
} as const;
export type PageEventName = typeof PageEventName[keyof typeof PageEventName];
