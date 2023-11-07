import React, { ReactElement, ReactNode, useEffect } from 'react';

import { NextPage } from 'next';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { SWRConfig } from 'swr';

import * as nextI18nConfig from '^/config/next-i18next.config';

import { GlobalFonts } from '~/components/FontFamily/GlobalFonts';
import { useI18nextHMR } from '~/services/i18next-hmr';
import {
  useAppTitle, useConfidential, useGrowiVersion, useSiteUrl, useIsDefaultLogo, useForcedColorScheme,
} from '~/stores/context';
import { swrGlobalConfiguration } from '~/utils/swr-utils';

import { CommonProps } from './utils/commons';
import { registerTransformerForObjectId } from './utils/objectid-transformer';

import '~/styles/prebuilt/vendor.css';
import '~/styles/font-icons.scss';
import '~/styles/style-app.scss';


const isDev = process.env.NODE_ENV === 'development';

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode,
}

type GrowiAppProps = AppProps & {
  Component: NextPageWithLayout,
};

// register custom serializer
registerTransformerForObjectId();

function GrowiApp({ Component, pageProps }: GrowiAppProps): JSX.Element {
  useI18nextHMR(isDev);

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
  }, []);


  const commonPageProps = pageProps as CommonProps;
  useAppTitle(commonPageProps.appTitle);
  useSiteUrl(commonPageProps.siteUrl);
  useConfidential(commonPageProps.confidential);
  useGrowiVersion(commonPageProps.growiVersion);
  useIsDefaultLogo(commonPageProps.isDefaultLogo);
  useForcedColorScheme(commonPageProps.forcedColorScheme);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? (page => page);

  return (
    <>
      <GlobalFonts />
      <SWRConfig value={swrGlobalConfiguration}>
        {getLayout(<Component {...pageProps} />)}
      </SWRConfig>
    </>
  );
}

export default appWithTranslation(GrowiApp, nextI18nConfig);
