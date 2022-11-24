export const SocketEventName = {
  // Update descendantCount
  UpdateDescCount: 'UpdateDescCount',

  // Public migration
  PMStarted: 'PublicMigrationStarted',
  PMMigrating: 'PublicMigrationMigrating',
  PMErrorCount: 'PublicMigrationErrorCount',
  PMEnded: 'PublicMigrationEnded',

  // Page migration
  PageMigrationSuccess: 'PageMigrationSuccess',
  PageMigrationError: 'PageMigrationError',

  // Elasticsearch
  AddPageProgress: 'addPageProgress',
  FinishAddPage: 'finishAddPage',
  RebuildingFailed: 'rebuildingFailed',

  // Page Operation
  PageCreated: 'page:create',
  PageUpdated: 'page:update',
  PageDeleted: 'page:delete',

} as const;
export type SocketEventName = typeof SocketEventName[keyof typeof SocketEventName];

type PageId = string;
type DescendantCount = number;
/**
 * Data of updateDescCount when used through socket.io. Convert to UpdateDescCountData type when use with swr cache.
 */
export type UpdateDescCountRawData = Record<PageId, DescendantCount>;
export type UpdateDescCountData = Map<PageId, DescendantCount>;

export type PMStartedData = { total: number };
export type PMMigratingData = { count: number };
export type PMErrorCountData = { skip: number };
export type PMEndedData = { isSucceeded: boolean };

export type PageMigrationErrorData = { paths: string[] }
