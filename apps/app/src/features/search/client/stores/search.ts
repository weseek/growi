import { SWRResponse } from 'swr';

import { useStaticSWR } from '~/stores/use-static-swr';

type SearchModalStatus = {
  isOpened: boolean,
}

type SearchModalUtils = {
  open(): void
  close(): void
}
export const useSearchModal = (status?: SearchModalStatus): SWRResponse<SearchModalStatus, Error> & SearchModalUtils => {
  const initialStatus = { isOpened: false };
  const swrResponse = useStaticSWR<SearchModalStatus, Error>('SearchModal', status, { fallbackData: initialStatus });

  return {
    ...swrResponse,
    open: () => swrResponse.mutate({ isOpened: true }),
    close: () => swrResponse.mutate({ isOpened: false }),
  };
};
