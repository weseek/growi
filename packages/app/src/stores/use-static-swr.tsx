import assert from 'assert';
import {
  Key, SWRConfiguration, SWRResponse,
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

  // mutate
  if (data !== undefined) {
    const { mutate } = swrResponse;
    mutate(data);
  }

  return swrResponse;
}


const ADVANCE_DELAY_MS = 800;

export type ITermNumberManagerUtil = {
  advance(): Promise<void>
}

export const useTermNumberManager = (key: Key) : SWRResponse<number, Error> & ITermNumberManagerUtil => {
  const swrResult = useStaticSWR<number, Error>(key, undefined, { fallbackData: 0 });

  return {
    ...swrResult,
    advance: async() => {
      const { data: currentNum } = swrResult;
      if (currentNum == null) {
        return;
      }

      await new Promise((r) => {
        setTimeout(async() => {
          await swrResult.mutate(currentNum + 1);
          r(null);
        }, ADVANCE_DELAY_MS);
      });
    },
  };
};
