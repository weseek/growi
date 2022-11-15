import React, { useCallback, useEffect, memo } from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useIsEnabledUnsavedWarning } from '~/stores/editor';

const UnsavedAlertDialog = (): JSX.Element => {
  const { t } = useTranslation();
  const router = useRouter();
  const { getIsEnabledUnsavedWarningFromCache } = useIsEnabledUnsavedWarning(); // Use getIsEnabledUnsavedWarningFromCache since eventListeners do not wait until states change

  const alertUnsavedWarningByBrowser = useCallback((e) => {
    const isEnabledUnsavedWarning = getIsEnabledUnsavedWarningFromCache();
    if (isEnabledUnsavedWarning) {
      e.preventDefault();
      // returnValue should be set to show alert dialog
      // default alert message cannot be changed.
      // See -> https://developer.mozilla.org/ja/docs/Web/API/Window/beforeunload_event
      e.returnValue = '';
      return;
    }
  }, [getIsEnabledUnsavedWarningFromCache]);

  const alertUnsavedWarningByNextRouter = useCallback(() => {
    const isEnabledUnsavedWarning = getIsEnabledUnsavedWarningFromCache();
    if (isEnabledUnsavedWarning) {
    // eslint-disable-next-line no-alert
      window.alert(t('page_edit.changes_not_saved'));
    }
    return;
  }, [getIsEnabledUnsavedWarningFromCache, t]);

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

export default memo(UnsavedAlertDialog);
