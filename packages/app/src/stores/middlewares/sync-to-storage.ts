import { isClient } from '@growi/core';
import { Middleware } from 'swr';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:stores:sync-to-storage');

const generateKeyInStorage = (key: string): string => {
  return `swr-cache-${key}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IStorageSerializer<Data = any> = {
  serialize: (value: Data) => string,
  deserialize: (value: string | null) => Data,
}

export const createSyncToStorageMiddlware = (
    storage: Storage,
    storageSerializer: IStorageSerializer = {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
): Middleware => {
  return (useSWRNext) => {
    return (key, fetcher, config) => {
      if (key == null) {
        return useSWRNext(key, fetcher, config);
      }

      const keyInStorage = generateKeyInStorage(key.toString());
      let initData = config.fallbackData;

      // retrieve initial data from storage
      const itemInStorage = storage.getItem(keyInStorage);
      if (itemInStorage != null) {
        try {
          initData = storageSerializer.deserialize(itemInStorage);
        }
        catch (e) {
          logger.warn(`Could not deserialize the item for the key '${keyInStorage}'`);
        }
      }

      config.fallbackData = initData;
      const swrNext = useSWRNext(key, fetcher, config);
      const swrMutate = swrNext.mutate;

      return Object.assign(swrNext, {
        mutate: (data, shouldRevalidate) => {
          return swrMutate(data, shouldRevalidate)
            .then((value) => {
              storage.setItem(keyInStorage, storageSerializer.serialize(value));
              return value;
            });
        },
      });
    };
  };
};

const passthroughMiddleware: Middleware = (useSWRNext) => {
  return (key, fetcher, config) => useSWRNext(key, fetcher, config);
};

export const localStorageMiddleware = isClient()
  ? createSyncToStorageMiddlware(localStorage)
  : passthroughMiddleware;

export const sessionStorageMiddleware = isClient()
  ? createSyncToStorageMiddlware(sessionStorage)
  : passthroughMiddleware;
