import React, {useCallback, useEffect} from 'react';
import {useUnsavedWarning } from '~/stores/editor'
import { useRouter } from 'next/router';

const unsavedAlertMsg = 'Changes you made may not be saved.'

const UnsavedAlertDialog = (): JSX.Element => {
  const router = useRouter();
  const { showAlertDialog } = useUnsavedWarning();

  const showAlertDialogForRouteChangesByBrowser = useCallback((e) => {
    e.preventDefault();
    showAlertDialog(unsavedAlertMsg);
    e.returnValue = '';
    return;
  },[]);

  /*
  *  Route changes by Browser
  *　Example: window.location.href, F5
  */
  useEffect(() => {
    window.addEventListener('beforeunload', showAlertDialogForRouteChangesByBrowser);
    return () => {
      window.removeEventListener('beforeunload', showAlertDialogForRouteChangesByBrowser);
    };
  }, []);


  /*
  * Route changes by Next Router
  * https://nextjs.org/docs/api-reference/next/router
  */
  useEffect(() => {
    router.events.on('routeChangeStart', () => showAlertDialog(unsavedAlertMsg))
    return () => {
      router.events.off('routeChangeStart', () => showAlertDialog(unsavedAlertMsg))
    };
  }, []);


  return (
    <>hoge</>
    )
};

export default UnsavedAlertDialog;
