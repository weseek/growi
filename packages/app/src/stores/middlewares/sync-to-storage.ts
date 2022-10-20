import { isClient } from '@growi/core';
import { Middleware } from 'swr';

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
        initData = storageSerializer.deserialize(itemInStorage);
      }

      config.fallbackData = initData;
      const swrNext = useSWRNext(key, fetcher, config);

      return Object.assign(swrNext, {
        mutate: (data, shouldRevalidate) => {
          return swrNext.mutate(data, shouldRevalidate)
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
