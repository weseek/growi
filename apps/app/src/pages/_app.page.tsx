import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';

import type { NextPage } from 'next';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { SWRConfig } from 'swr';

import * as nextI18nConfig from '^/config/next-i18next.config';

import { GlobalFonts } from '~/components-universal/FontFamily/GlobalFonts';
import {
  useAppTitle, useConfidential, useGrowiVersion, useSiteUrl, useIsDefaultLogo, useForcedColorScheme,
} from '~/stores-universal/context';
import { swrGlobalConfiguration } from '~/utils/swr-utils';

import type { CommonProps } from './utils/commons';
import { registerTransformerForObjectId } from './utils/objectid-transformer';

import '~/styles/prebuilt/vendor.css';
import '~/styles/style-app.scss';


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
