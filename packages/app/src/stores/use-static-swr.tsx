import useSWR, {
  Key, SWRConfiguration, SWRResponse, mutate,
} from 'swr';
import { Fetcher } from 'swr/dist/types';


export function useStaticSWR<Data, Error>(key: Key): SWRResponse<Data, Error>;
export function useStaticSWR<Data, Error>(key: Key, data: Data | Fetcher<Data> | null): SWRResponse<Data, Error>;
export function useStaticSWR<Data, Error>(key: Key, data: Data | Fetcher<Data> | null,
  configuration: SWRConfiguration<Data, Error> | undefined): SWRResponse<Data, Error>;

export function useStaticSWR<Data, Error>(
    ...args: readonly [Key]
    | readonly [Key, Data | Fetcher<Data> | null]
    | readonly [Key, Data | Fetcher<Data> | null, SWRConfiguration<Data, Error> | undefined]
): SWRResponse<Data, Error> {
  const [key, fetcher, configuration] = args;

  const fetcherFixed = fetcher || configuration?.fetcher;
  if (fetcherFixed != null) {
    mutate(key, fetcherFixed);
  }

  return useSWR(key, null, configuration);
}
