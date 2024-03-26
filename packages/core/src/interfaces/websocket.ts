export const GlobalSocketEventName = {
  // YDoc
  YDocSync: 'ydoc:sync',
  YDocSyncError: 'ydoc:sync:error',
} as const;
export type GlobalSocketEventName = typeof GlobalSocketEventName[keyof typeof GlobalSocketEventName];
