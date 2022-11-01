import {
  Key, SWRConfiguration, SWRResponse,
} from 'swr';

import { useStaticSWR } from './use-static-swr';

// omit mutate from swr response because context shouldn't be changed
export type ContextSWRResponse<Data = any, Error = any> = Omit<SWRResponse<Data, Error>, 'mutate'>

export function useContextSWR<Data, Error>(key: Key): ContextSWRResponse<Data, Error>;
export function useContextSWR<Data, Error>(key: Key, data: Data | undefined): ContextSWRResponse<Data, Error>;
export function useContextSWR<Data, Error>(key: Key, data: Data | undefined,
  configuration: SWRConfiguration<Data, Error> | undefined): ContextSWRResponse<Data, Error>;

export function useContextSWR<Data, Error>(
    ...args: readonly [Key]
    | readonly [Key, Data | undefined]
    | readonly [Key, Data | undefined, SWRConfiguration<Data, Error> | undefined]
): ContextSWRResponse<Data, Error> {
  const [key, data, configuration] = args;

  const swrResponse = useStaticSWR<Data, Error>(key, data, configuration);
  const { data: responseData, error, isValidating } = swrResponse;

  return {
    data: responseData,
    error,
    isValidating,
  };
}
