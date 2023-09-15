import { useCallback, useEffect, useRef } from 'react';

import { type SWRResponseWithUtils, withUtils } from '@growi/core/dist/swr';
import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';


type UseKeywordManagerUtils = {
  pushState: (newKeyword: string) => void,
}

export const useKeywordManager = (): SWRResponseWithUtils<UseKeywordManagerUtils, string> => {
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
  const pushState = useCallback((newKeyword: string) => {
    mutate((prevKeyword) => {
      if (prevKeyword !== newKeyword) {
        const newUrl = new URL('/_search', 'http://example.com');
        newUrl.searchParams.append('q', newKeyword);
        routerRef.current.push(`${newUrl.pathname}${newUrl.search}`, '');
      }

      return newKeyword;
    });
  }, [mutate]);

  // detect search keyword from the query of URL
  useEffect(() => {
    mutate(initialKeyword);
  }, [mutate, initialKeyword]);

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
    pushState,
  });
};
