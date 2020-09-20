import useSWR, { mutate, responseInterface } from 'swr';

export const useStaticSWR = <Data, Error>(key: string, initialData?: Data): responseInterface<Data, Error> => {
  if (initialData != null) {
    mutate(key, initialData);
  }
  return useSWR(key);
};
