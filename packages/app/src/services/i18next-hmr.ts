import { useEffect } from 'react';

import { useTranslation } from 'next-i18next';

const isServer = typeof window === 'undefined';

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

  if (isServer) {
    import('i18next-hmr/server').then(({ applyServerHMR }) => {
      applyServerHMR(i18n);
    });
  }
};
