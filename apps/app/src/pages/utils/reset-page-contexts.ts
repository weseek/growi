import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { useIsSearchPage, useIsSharedUser } from '~/states/context';
import { useRedirectFrom } from '~/states/page/redirect';

export const useResetPageContextsOnNextRouting = (): void => {
  const router = useRouter();
  const [, setRedirectFrom] = useRedirectFrom();
  const [, setIsSharedUser] = useIsSharedUser();
  const [, setIsSearchPage] = useIsSearchPage();

  useEffect(() => {
    const resetPageContexts = () => {
      setRedirectFrom(null);
      setIsSharedUser(false);
      setIsSearchPage(false);
    };
    router.events.on('routeChangeStart', resetPageContexts);
    return () => {
      router.events.off('routeChangeStart', resetPageContexts);
    };
  }, [router, setIsSearchPage, setIsSharedUser, setRedirectFrom]);
};
