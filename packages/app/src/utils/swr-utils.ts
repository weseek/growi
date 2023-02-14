import { isServer } from '@growi/core';

export const swrGlobalConfiguration = Object.assign(
  {
    errorRetryCount: 1,
  },
  // set the request scoped cache provider in server
  isServer()
    ? {
      provider: (cache: any) => new Map<string, any>(cache),
    }
    : {},
);
