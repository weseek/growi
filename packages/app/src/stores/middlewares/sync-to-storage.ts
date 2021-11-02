import { Middleware } from 'swr';

const generateKeyInStorage = (key: string): string => {
  return `swr-cache-${key}`;
};

export type IStorageSerializer<Data> = {
  serialize: (value: Data) => string,
  deserialize: (value: string | null) => Data,
}

export const createSyncToStorageMiddlware = <Data>(
  storage: Storage,
  storageSerializer: IStorageSerializer<Data> = {
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
      let initData;

      // retrieve initial data from storage
      const itemInStorage = storage.getItem(keyInStorage);
      if (itemInStorage != null) {
        initData = storageSerializer.deserialize(itemInStorage);
      }

      const swrNext = useSWRNext(key, fetcher, {
        fallbackData: initData,
        ...config,
      });

      return {
        ...swrNext,
        // override mutate
        mutate: (data, shouldRevalidate) => {
          return swrNext.mutate(data, shouldRevalidate)
            .then((value) => {
              storage.setItem(generateKeyInStorage(keyInStorage), storageSerializer.serialize(value));
              return value;
            });
        },
      };
    };
  };
};

export const localStorageMiddleware = createSyncToStorageMiddlware(localStorage);

export const sessionStorageMiddleware = createSyncToStorageMiddlware(sessionStorage);
