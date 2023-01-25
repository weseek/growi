import { useEffect } from 'react';

import assert from 'assert';

import {
  mutate, Key, SWRConfiguration, SWRResponse,
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

  assert.notStrictEqual(configuration?.fetcher, null, 'useStaticSWR does not support \'configuration.fetcher\'');

  const swrResponse = useSWRImmutable(key, null, configuration);

  // Do mutate with `data` from args
  useEffect(() => {
    if (data !== undefined) {
      mutate(key, data);
    }
  }, [data, key]);

  return swrResponse;
}


const ADVANCE_DELAY_MS = 800;

export type ITermNumberManagerUtil = {
  advance(): void,
}

export const useTermNumberManager = (key: Key) : SWRResponse<number, Error> & ITermNumberManagerUtil => {
  const swrResult = useStaticSWR<number, Error>(key, undefined, { fallbackData: 0 });

  return {
    ...swrResult,
    advance: () => {
      const { data: currentNum } = swrResult;
      if (currentNum == null) {
        return;
      }

      setTimeout(() => {
        swrResult.mutate(currentNum + 1);
      }, ADVANCE_DELAY_MS);
    },
  };
};
