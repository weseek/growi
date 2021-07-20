import { useCallback } from 'react';
import useSWR, {
  keyInterface, SWRResponse, mutate, cache,
} from 'swr';
import { SWRConfiguration, fetcherFn, mutateCallback } from 'swr/dist/types';


export const useStaticSWR = <Data, Error>(
  key: keyInterface,
  updateData?: Data | fetcherFn<Data>,
  initialData?: Data | fetcherFn<Data>,
): SWRResponse<Data, Error> => {

  if (updateData == null) {
    if (!cache.has(key) && initialData != null) {
      mutate(key, initialData, false);
    }
  }
  else {
    mutate(key, updateData);
  }

  return useSWR(key, {
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
  key: keyInterface,
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
  res.mutate = (data?: Data | Promise<Data> | mutateCallback<Data>) :Promise<Data | undefined> => {
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
  key: keyInterface,
  config?: SWRConfiguration<Data, Error> & serializeInterface<Data>,
): SWRResponse<Data, Error> => {
  return useStorageSyncedSWR(localStorage, key, config);
};

export const useSessionStorageSyncedSWR = <Data, Error>(
  key: keyInterface,
  config?: SWRConfiguration<Data, Error> & serializeInterface<Data>,
): SWRResponse<Data, Error> => {
  return useStorageSyncedSWR(sessionStorage, key, config);
};
