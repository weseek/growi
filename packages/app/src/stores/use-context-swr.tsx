import {
  Key, SWRConfiguration, SWRResponse,
} from 'swr';

import { useStaticSWR } from './use-static-swr';

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

  const swrResponse = useStaticSWR<Data, Error>(key, data, configuration);

  const result = Object.assign(swrResponse, { mutate: () => { throw Error('mutate can not be used in context') } });

  return result;
}
