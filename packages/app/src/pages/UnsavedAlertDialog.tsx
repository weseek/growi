import { useCallback, useEffect } from 'react';

import { useRouter } from 'next/router';

import { useUnsavedWarning } from '~/stores/editor';

const unsavedAlertMsg = 'Changes you made may not be saved.';

const UnsavedAlertDialog = (): void => {
  const router = useRouter();
  const { showAlertDialog } = useUnsavedWarning();

  const showAlertDialogForRouteChangesByBrowser = useCallback((e) => {
    e.preventDefault();
    showAlertDialog(unsavedAlertMsg);
    e.returnValue = '';
    return;
  }, [showAlertDialog]);

  /*
  * Route changes by Browser
  * Example: window.location.href, F5
  */
  useEffect(() => {
    window.addEventListener('beforeunload', showAlertDialogForRouteChangesByBrowser);
    return () => {
      window.removeEventListener('beforeunload', showAlertDialogForRouteChangesByBrowser);
    };
  }, [showAlertDialogForRouteChangesByBrowser]);


  /*
  * Route changes by Next Router
  * https://nextjs.org/docs/api-reference/next/router
  */
  useEffect(() => {
    router.events.on('routeChangeStart', () => showAlertDialog(unsavedAlertMsg));
    return () => {
      router.events.off('routeChangeStart', () => showAlertDialog(unsavedAlertMsg));
    };
  }, [router.events, showAlertDialog]);


  return;
};

export default UnsavedAlertDialog;
