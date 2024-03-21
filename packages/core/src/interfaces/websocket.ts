export const GlobalSocketEventName = {
  // YDoc
  YDocSync: 'ydoc:sync',
  YDocSyncError: 'ydoc:sync:error',
  YDocUpdate: 'ydoc:update',
} as const;
export type GlobalSocketEventName = typeof GlobalSocketEventName[keyof typeof GlobalSocketEventName];
