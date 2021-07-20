import { useCallback } from 'react';
import useSWR, {
  Key, SWRResponse, mutate, cache
} from 'swr';
import { SWRConfiguration, Fetcher, MutatorCallback } from 'swr/dist/types';


export const useStaticSWR = <Data, Error>(
  key: Key,
  updateData?: Data | Fetcher<Data>,
  initialData?: Data | Fetcher<Data>,
): SWRResponse<Data, Error> => {

  if (updateData == null) {
    if (!cache.has(key) && initialData != null) {
      mutate(key, initialData, false);
    }
  }
  else {
    mutate(key, updateData);
  }

  return useSWR(key, null, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};

type serializeInterface<Data> = {
  serialize?: (value: unknown) => string,
  deserialize?: (value: string | null) => any,
}

const generateKeyInStorage = (key: string): string => {
  return `swr-${key}`;
};

export const useStorageSyncedSWR = <Data, Error>(
  storage: Storage,
  key: Key,
  config?: SWRConfiguration<Data, Error> & serializeInterface<Data>,
): SWRResponse<Data, Error> => {

  const serialize = config?.serialize;
  const deserialize = config?.deserialize;

  // define fetcher
  const fetcher = useCallback((key) => {
    const keyInStorage = generateKeyInStorage(key as string);
    const value = storage.getItem(keyInStorage);
    return deserialize ? deserialize(value) : value;
  }, [storage, deserialize]);

  const res = useSWR(
    key,
    fetcher,
    {
      ...config,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      initialData: fetcher(key), // set initial data
    },
  );

  // replace mutate method
  const originalMutate = res.mutate;
  res.mutate = (data?: Data | Promise<Data> | MutatorCallback<Data>) :Promise<Data | undefined> => {
    if (key != null) {
      const keyInStorage = generateKeyInStorage(key as string);

      if (data == null) {
        storage.removeItem(keyInStorage);
      }
      else {
        const value = serialize ? serialize(data) : data as unknown;
        storage.setItem(keyInStorage, value as string);
      }
    }
    return originalMutate(data);
  };

  return res;
};

export const useLocalStorageSyncedSWR = <Data, Error>(
  key: Key,
  config?: SWRConfiguration<Data, Error> & serializeInterface<Data>,
): SWRResponse<Data, Error> => {
  return useStorageSyncedSWR(localStorage, key, config);
};

export const useSessionStorageSyncedSWR = <Data, Error>(
  key: Key,
  config?: SWRConfiguration<Data, Error> & serializeInterface<Data>,
): SWRResponse<Data, Error> => {
  return useStorageSyncedSWR(sessionStorage, key, config);
};
