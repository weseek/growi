import {
  Key, SWRConfiguration, SWRResponse, useSWRConfig,
} from 'swr';
import useSWRImmutable from 'swr/immutable';


export function useStaticSWR<Data, Error>(key: Key): SWRResponse<Data, Error>;
export function useStaticSWR<Data, Error>(key: Key, data: Data | undefined): SWRResponse<Data, Error>;
export function useStaticSWR<Data, Error>(key: Key, data: Data | undefined,
  configuration: SWRConfiguration<Data, Error> | undefined): SWRResponse<Data, Error>;

export function useStaticSWR<Data, Error>(
    ...args: readonly [Key]
    | readonly [Key, Data | undefined]
    | readonly [Key, Data | undefined, SWRConfiguration<Data, Error> | undefined]
): SWRResponse<Data, Error> {
  const [key, data, configuration] = args;

  // assert.notStrictEqual(configuration?.fetcher, null, 'useStaticSWR does not support \'configuration.fetcher\'');

  const { cache } = useSWRConfig();
  const swrResponse = useSWRImmutable(key, null, {
    ...configuration,
    fallbackData: configuration?.fallbackData ?? cache.get(key)?.data,
  });

  // write data to cache directly
  if (data !== undefined) {
    cache.set(key, { ...cache.get(key), data });
  }

  return swrResponse;
}
