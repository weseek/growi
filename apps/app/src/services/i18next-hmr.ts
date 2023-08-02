import { useEffect } from 'react';

import { isServer } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';

export const useI18nextHMR = (isDev: boolean): void => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (isDev) {
      import('i18next-hmr/client').then(({ applyClientHMR }) => {
        applyClientHMR(i18n);
      });
    }
  }, [i18n, isDev]);

  if (!isDev) {
    return;
  }

  if ((isServer())) {
    import('i18next-hmr/server').then(({ applyServerHMR }) => {
      applyServerHMR(i18n);
    });
  }
};
