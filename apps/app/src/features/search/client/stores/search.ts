import type { SWRResponse } from 'swr';

import { useStaticSWR } from '~/stores/use-static-swr';

type SearchModalStatus = {
  isOpened: boolean,
  searchKeyword?: string,
}

type SearchModalUtils = {
  open(keywordOnInit?: string): void
  close(): void
}
export const useSearchModal = (status?: SearchModalStatus): SWRResponse<SearchModalStatus, Error> & SearchModalUtils => {
  const initialStatus = { isOpened: false };
  const swrResponse = useStaticSWR<SearchModalStatus, Error>('SearchModal', status, { fallbackData: initialStatus });

  return {
    ...swrResponse,
    open: (keywordOnInit?: string) => {
      swrResponse.mutate({ isOpened: true, searchKeyword: keywordOnInit });
    },
    close: () => swrResponse.mutate({ isOpened: false }),
  };
};
