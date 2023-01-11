import React, { ReactElement, ReactNode, useEffect } from 'react';

import { isServer } from '@growi/core';
import { NextPage } from 'next';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { SWRConfig } from 'swr';

import * as nextI18nConfig from '^/config/next-i18next.config';

import { ActivatePluginService } from '~/client/services/activate-plugin';
import { useI18nextHMR } from '~/services/i18next-hmr';
import {
  useAppTitle, useConfidential, useGrowiVersion, useSiteUrl, useIsDefaultLogo,
} from '~/stores/context';
import { SWRConfigValue, swrGlobalConfiguration } from '~/utils/swr-utils';


import { CommonProps } from './utils/commons';
import { registerTransformerForObjectId } from './utils/objectid-transformer';

import '~/styles/style-app.scss';
import '~/styles/theme/_apply-colors-light.scss';
import '~/styles/theme/_apply-colors-dark.scss';
import '~/styles/theme/_apply-colors.scss';

const isDev = process.env.NODE_ENV === 'development';

const swrConfig: SWRConfigValue = {
  ...swrGlobalConfiguration,
  // set the request scoped cache provider in server
  provider: isServer()
    ? cache => new Map(cache)
    : undefined,
};


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

  useEffect(() => {
    ActivatePluginService.activateAll();
  }, []);


  const commonPageProps = pageProps as CommonProps;
  // useInterceptorManager(new InterceptorManager());
  useAppTitle(commonPageProps.appTitle);
  useSiteUrl(commonPageProps.siteUrl);
  useConfidential(commonPageProps.confidential);
  useGrowiVersion(commonPageProps.growiVersion);
  useIsDefaultLogo(commonPageProps.isDefaultLogo);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? (page => page);

  return (
    <SWRConfig value={swrConfig}>
      {getLayout(<Component {...pageProps} />)}
    </SWRConfig>
  );
}

// export default appWithTranslation(GrowiApp);

export default appWithTranslation(GrowiApp, nextI18nConfig);
