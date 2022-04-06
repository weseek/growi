import assert from 'assert';
import {
  Key, SWRConfiguration, SWRResponse,
} from 'swr';
import useSWRImmutable from 'swr/immutable';


export function useStaticSWR<Data, Error>(key: Key): SWRResponse<Data, Error>;
export function useStaticSWR<Data, Error>(key: Key, data: Data | null): SWRResponse<Data, Error>;
export function useStaticSWR<Data, Error>(key: Key, data: Data | null,
  configuration: SWRConfiguration<Data, Error> | undefined): SWRResponse<Data, Error>;

export function useStaticSWR<Data, Error>(
    ...args: readonly [Key]
    | readonly [Key, Data | null]
    | readonly [Key, Data | null, SWRConfiguration<Data, Error> | undefined]
): SWRResponse<Data, Error> {
  const [key, data, configuration] = args;

  assert.notStrictEqual(configuration?.fetcher, null, 'useStaticSWR does not support \'configuration.fetcher\'');

  const swrResponse = useSWRImmutable(key, null, configuration);

  // mutate
  if (data != null) {
    const { mutate } = swrResponse;
    mutate(data);
  }

  return swrResponse;
}
