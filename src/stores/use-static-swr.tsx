import useSWR, { keyInterface, mutate, responseInterface } from 'swr';

export const useStaticSWR = <Data, Error>(key: keyInterface, initialData?: Data): responseInterface<Data, Error> => {
  if (initialData != null) {
    mutate(key, initialData);
  }
  return useSWR(key);
};
