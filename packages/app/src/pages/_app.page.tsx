import React, { useEffect } from 'react';

import { isServer } from '@growi/core';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SWRConfig } from 'swr';

import * as nextI18nConfig from '^/config/next-i18next.config';

import { useI18nextHMR } from '~/services/i18next-hmr';
import {
  useAppTitle, useConfidential, useGrowiTheme, useGrowiVersion, useSiteUrl,
} from '~/stores/context';
import { NextThemesProvider } from '~/stores/use-next-themes';
import { SWRConfigValue, swrGlobalConfiguration } from '~/utils/swr-utils';


import { CommonProps } from './utils/commons';
import { registerTransformerForObjectId } from './utils/objectid-transformer';

import '~/styles/style-next.scss';
import '~/styles/style-themes.scss';


const isDev = process.env.NODE_ENV === 'development';

const swrConfig: SWRConfigValue = {
  ...swrGlobalConfiguration,
  // set the request scoped cache provider in server
  provider: isServer()
    ? cache => new Map(cache)
    : undefined,
};


type GrowiAppProps = AppProps & {
  pageProps: CommonProps;
};
// register custom serializer
registerTransformerForObjectId();

function GrowiApp({ Component, pageProps }: GrowiAppProps): JSX.Element {
  useI18nextHMR(isDev);

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
  }, []);


  const commonPageProps = pageProps as CommonProps;
  // useInterceptorManager(new InterceptorManager());
  useAppTitle(commonPageProps.appTitle);
  useSiteUrl(commonPageProps.siteUrl);
  useConfidential(commonPageProps.confidential);
  useGrowiTheme(commonPageProps.theme);
  useGrowiVersion(commonPageProps.growiVersion);

  return (
    <SWRConfig value={swrConfig}>
      <NextThemesProvider>
        <DndProvider backend={HTML5Backend}>
          <Component {...pageProps} />
        </DndProvider>
      </NextThemesProvider>
    </SWRConfig>
  );
}

// export default appWithTranslation(GrowiApp);

export default appWithTranslation(GrowiApp, nextI18nConfig);
