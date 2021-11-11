import useSWR, {
  Key, SWRResponse, mutate, useSWRConfig,
} from 'swr';
import { Fetcher } from 'swr/dist/types';


export const useStaticSWR = <Data, Error>(
  key: Key,
  initialData?: Data | Fetcher<Data>,
  updateData?: Data | Fetcher<Data>,
): SWRResponse<Data, Error> => {
  const { cache } = useSWRConfig();

  if (updateData == null) {
    if (cache.get(key) == null && initialData != null) {
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
