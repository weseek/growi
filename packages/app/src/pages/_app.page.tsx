import React, { useEffect } from 'react';

import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import '~/styles/style-next.scss';
// import '~/styles/theme/default.scss';
// import InterceptorManager from '~/service/interceptor-manager';

import * as nextI18nConfig from '^/config/next-i18next.config';

import { NextThemesProvider } from '~/stores/use-next-themes';

import { useI18nextHMR } from '../services/i18next-hmr';
import {
  useAppTitle, useConfidential, useGrowiTheme, useGrowiVersion, useSiteUrl,
} from '../stores/context';

import { CommonProps } from './utils/commons';
import { registerTransformerForObjectId } from './utils/objectid-transformer';
// import { useInterceptorManager } from '~/stores/interceptor';

const isDev = process.env.NODE_ENV === 'development';

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
    <NextThemesProvider>
      <DndProvider backend={HTML5Backend}>
        <Component {...pageProps} />
      </DndProvider>
    </NextThemesProvider>
  );
}

// export default appWithTranslation(GrowiApp);

export default appWithTranslation(GrowiApp, nextI18nConfig);
