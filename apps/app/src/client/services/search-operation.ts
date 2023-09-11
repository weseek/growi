import { useCallback, useEffect, useRef } from 'react';

import { type SWRResponseWithUtils, withUtils } from '@growi/core/dist/swr';
import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';


type UseSearchOperation = {
  search: (newKeyword: string, ignorePushingState?: boolean) => void,
}

export const useSearchOperation = (): SWRResponseWithUtils<UseSearchOperation, string> => {
  // routerRef solve the problem of infinite redrawing that occurs with routers
  const router = useRouter();
  const routerRef = useRef(router);

  // parse URL Query
  const queries = router.query.q;
  const initialKeyword = (Array.isArray(queries) ? queries.join(' ') : queries) ?? '';

  const swrResponse = useSWRImmutable<string>('searchKeyword', null, {
    fallbackData: initialKeyword,
  });

  const { mutate } = swrResponse;
  const search = useCallback((newKeyword: string, ignorePushingState?: boolean) => {
    mutate(newKeyword);

    if (ignorePushingState !== true) {
      const newUrl = new URL('/_search', 'http://example.com');
      newUrl.searchParams.append('q', newKeyword);
      // routerRef.current.push(`${newUrl.pathname}${newUrl.search}`, '', { shallow: true });
      routerRef.current.push(`${newUrl.pathname}${newUrl.search}`, '');
    }
  }, [mutate]);

  // browser back and forward
  useEffect(() => {
    routerRef.current.beforePopState(({ url }) => {
      const newUrl = new URL(url, 'https://exmple.com');
      const newKeyword = newUrl.searchParams.get('q');
      if (newKeyword != null) {
        mutate(newKeyword);
      }
      return true;
    });
  }, [mutate]);

  return withUtils(swrResponse, {
    search,
  });
};
