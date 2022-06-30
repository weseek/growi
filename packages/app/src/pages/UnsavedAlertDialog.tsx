import { useCallback, useEffect } from 'react';

import { useRouter } from 'next/router';

import { useIsEnabledUnsavedWarning } from '~/stores/editor';

const alertMsg = 'Changes you made may not be saved.';

const UnsavedAlertDialog = (): void => {
  const router = useRouter();
  const { data: isEnabledUnsavedWarning } = useIsEnabledUnsavedWarning();

  const alertUnsavedWarningByBrowser = useCallback((e) => {
    if(isEnabledUnsavedWarning){
      e.preventDefault();
      // returnValue should be set to show alert dialog
      e.returnValue = alertMsg;
      return;
    }
  }, [isEnabledUnsavedWarning]);

  const alertUnsavedWarningByNextRouter = useCallback(() => {
    if(isEnabledUnsavedWarning){
      window.alert(alertMsg);
    }
    return;
  }, [isEnabledUnsavedWarning]);

  /*
  * Route changes by Browser
  * Example: window.location.href, F5
  */
  useEffect(() => {
    window.addEventListener('beforeunload', alertUnsavedWarningByBrowser);
    return () => {
      window.removeEventListener('beforeunload', alertUnsavedWarningByBrowser);
    };
  }, [alertUnsavedWarningByBrowser]);


  /*
  * Route changes by Next Router
  * https://nextjs.org/docs/api-reference/next/router
  */
  useEffect(() => {
    router.events.on('routeChangeStart', () => alertUnsavedWarningByNextRouter());
    return () => {
      router.events.off('routeChangeStart', () => alertUnsavedWarningByNextRouter());
    };
  }, [router.events]);


  return;
};

export default UnsavedAlertDialog;
