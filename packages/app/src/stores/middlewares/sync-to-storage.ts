import { useSWRConfig, Middleware } from 'swr';

const generateKeyInStorage = (key: string): string => {
  return `swr-cache-${key}`;
};

export type IStorageSerializer<Data> = {
  serialize: (value: Data) => string,
  deserialize: (value: string | null) => Data,
}


const createSyncToStorageMiddlware = <Data>(
  storage: Storage,
  storageSerializer: IStorageSerializer<Data> = {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  },
): Middleware => {
  return (useSWRNext) => {
    return (key, fetcher, config) => {
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

// const createStorageProvider = <Data>(
//   storage: Storage,
//   storageSerializer: IStorageSerializer<Data> = {
//     serialize: JSON.stringify,
//     deserialize: JSON.parse,
//   },
// ): Cache<Data> => {
//   const map: Map<string, Data> = new Map();

//   return {
//     get(key: string): Data | undefined {
//       if (!map.has(key)) {
//         let newCachedData = null;

//         // retrieve from storage
//         const itemInStorage = storage.getItem(generateKeyInStorage(key));
//         if (itemInStorage != null) {
//           newCachedData = storageSerializer.deserialize(itemInStorage);
//         }

//         // set
//         map.set(key, newCachedData);
//       }
//       return map.get(key);
//     },
//     set(key: string, value: Data): void {
//       map.set(key, value);
//       storage.setItem(generateKeyInStorage(key), storageSerializer.serialize(value));
//     },
//     delete(key: string): void {
//       map.delete(key);
//       storage.removeItem(generateKeyInStorage(key));
//     },
//   };
// };

// export const localStorageProvider = <Data>(option?: { storageSerializer?: IStorageSerializer<Data> }): Cache<Data> => {
//   return createStorageProvider(localStorage, option?.storageSerializer);
// };

// export const sessionStorageProvider = <Data>(storageSerializer?: IStorageSerializer<Data>): Cache<Data> => {
//   return createStorageProvider(sessionStorage, storageSerializer);
// };
