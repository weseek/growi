import React, { useCallback, useEffect } from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useIsEnabledUnsavedWarning } from '~/stores/editor';

const UnsavedAlertDialog = (): JSX.Element => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: isEnabledUnsavedWarning } = useIsEnabledUnsavedWarning();

  const alertUnsavedWarningByBrowser = useCallback((e) => {
    if (isEnabledUnsavedWarning) {
      e.preventDefault();
      // returnValue should be set to show alert dialog
      // default alert message cannot be changed.
      // See -> https://developer.mozilla.org/ja/docs/Web/API/Window/beforeunload_event
      e.returnValue = '';
      return;
    }
  }, [isEnabledUnsavedWarning]);

  const alertUnsavedWarningByNextRouter = useCallback(() => {
    if (isEnabledUnsavedWarning) {
    // eslint-disable-next-line no-alert
      window.alert(t('page_edit.changes_not_saved'));
    }
    return;
  }, [isEnabledUnsavedWarning, t]);

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
    router.events.on('routeChangeStart', alertUnsavedWarningByNextRouter);
    return () => {
      router.events.off('routeChangeStart', alertUnsavedWarningByNextRouter);
    };
  }, [alertUnsavedWarningByNextRouter, router.events]);


  return <></>;
};

export default UnsavedAlertDialog;
