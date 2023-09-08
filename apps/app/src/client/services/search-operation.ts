import {
  useCallback, useEffect, useRef, useState,
} from 'react';

import { useRouter } from 'next/router';

type UseSearchOperation = {
  keyword: string,
  search: (newKeyword: string, ignorePushingState?: boolean) => void,
}

export const useSearchOperation = (): UseSearchOperation => {
  // routerRef solve the problem of infinite redrawing that occurs with routers
  const router = useRouter();
  const routerRef = useRef(router);

  // parse URL Query
  const queries = router.query.q;
  const initialKeyword = (Array.isArray(queries) ? queries.join(' ') : queries) ?? '';

  const [keyword, setKeyword] = useState(initialKeyword);

  const search = useCallback((newKeyword: string, ignorePushingState?: boolean) => {
    setKeyword(newKeyword);

    if (ignorePushingState !== true) {
      const newUrl = new URL('/_search', 'http://example.com');
      newUrl.searchParams.append('q', newKeyword);
      routerRef.current.push(`${newUrl.pathname}${newUrl.search}`, '', { shallow: true });
    }
  }, []);

  // browser back and forward
  useEffect(() => {
    routerRef.current.beforePopState(({ url }) => {
      const newUrl = new URL(url, 'https://exmple.com');
      const newKeyword = newUrl.searchParams.get('q');
      if (newKeyword != null) {
        setKeyword(newKeyword);
      }
      return true;
    });
  }, [setKeyword, routerRef]);

  return {
    keyword,
    search,
  };
};
