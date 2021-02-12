import useSWR, {
  keyInterface, responseInterface, mutate, cache,
} from 'swr';
import { fetcherFn } from 'swr/dist/types';

export const useStaticSWR = <Data, Error>(
  key: keyInterface,
  updateData?: Data | fetcherFn<Data>,
  initialData?: Data | fetcherFn<Data>,
): responseInterface<Data, Error> => {

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

const generateKeyInStorage = (key: string): string => {
  return `swr-${key}`;
};

export const useLocalStorageSyncedSWR = (key: string | null, updateData?: string | null): responseInterface<string | null, Error> => {
  return useStaticSWR(
    key,
    // update func
    () => {
      if (key == null || updateData == null) {
        return null;
      }
      localStorage.setItem(generateKeyInStorage(key), updateData);
      return updateData;
    },
    // initialize func
    () => {
      if (key == null) {
        return null;
      }
      return localStorage.getItem(generateKeyInStorage(key));
    },
  );
};

export const useSessionStorageSyncedSWR = (key: string | null, updateData?: string | null): responseInterface<string | null, Error> => {
  return useStaticSWR(
    key,
    // update func
    () => {
      if (key == null || updateData == null) {
        return null;
      }
      sessionStorage.setItem(generateKeyInStorage(key), updateData);
      return updateData;
    },
    // initialize func
    () => {
      if (key == null) {
        return null;
      }
      return sessionStorage.getItem(generateKeyInStorage(key));
    },
  );
};
