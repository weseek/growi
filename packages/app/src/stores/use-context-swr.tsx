import assert from 'assert';

import {
  Key, SWRConfiguration, SWRResponse, useSWRConfig,
} from 'swr';
import useSWRImmutable from 'swr/immutable';


export function useContextSWR<Data, Error>(key: Key): SWRResponse<Data, Error>;
export function useContextSWR<Data, Error>(key: Key, data: Data | undefined): SWRResponse<Data, Error>;
export function useContextSWR<Data, Error>(key: Key, data: Data | undefined,
  configuration: SWRConfiguration<Data, Error> | undefined): SWRResponse<Data, Error>;

export function useContextSWR<Data, Error>(
    ...args: readonly [Key]
    | readonly [Key, Data | undefined]
    | readonly [Key, Data | undefined, SWRConfiguration<Data, Error> | undefined]
): SWRResponse<Data, Error> {
  const [key, data, configuration] = args;

  assert.notStrictEqual(configuration?.fetcher, null, 'useContextSWR does not support \'configuration.fetcher\'');

  const { cache } = useSWRConfig();
  const swrResponse = useSWRImmutable(key, null, {
    ...configuration,
    fallbackData: configuration?.fallbackData ?? cache.get(key),
  });

  // write data to cache directly
  if (data !== undefined) {
    cache.set(key, { ...cache.get(key), data });
  }

  const result = Object.assign(swrResponse, { mutate: () => { throw Error('mutate can not be used in context') } });

  return result;
}
