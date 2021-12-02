import {
  Key, SWRConfiguration, SWRResponse,
} from 'swr';
import useSWRImmutable from 'swr/immutable';
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

  const swrResponse = useSWRImmutable(key, null, configuration);

  // mutate
  const fetcherFixed = fetcher || configuration?.fetcher;
  if (fetcherFixed != null) {
    const { mutate } = swrResponse;
    mutate(fetcherFixed);
  }

  return swrResponse;
}
