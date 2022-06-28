import { useEffect } from "react"
import { useTranslation } from "next-i18next"

const isServer = typeof window === 'undefined';

export const useI18nextHMR = (isDev: boolean) => {
  const { i18n } = useTranslation()

  if (!isDev) {
    return;
  }

  if (isServer) {
    import("i18next-hmr/server").then(({ applyServerHMR }) => {
      applyServerHMR(i18n)
    });
  }

  useEffect(() => {
    import("i18next-hmr/client").then(({ applyClientHMR }) => {
      applyClientHMR(i18n)
    })
  }, [i18n]);
}
