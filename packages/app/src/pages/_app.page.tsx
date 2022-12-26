import React, { useEffect } from 'react';

import { isServer } from '@growi/core';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { SWRConfig } from 'swr';

import * as nextI18nConfig from '^/config/next-i18next.config';

import { ActivatePluginService } from '~/client/services/activate-plugin';
import { useI18nextHMR } from '~/services/i18next-hmr';
import {
  useAppTitle, useConfidential, useGrowiVersion, useSiteUrl, useCustomizedLogoSrc,
} from '~/stores/context';
import { SWRConfigValue, swrGlobalConfiguration } from '~/utils/swr-utils';


import { CommonProps } from './utils/commons';
import { registerTransformerForObjectId } from './utils/objectid-transformer';

import '~/styles/style-app.scss';
import '~/styles/theme/_apply-colors.scss';
import '~/styles/theme/_apply-colors-light.scss';

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

  useEffect(() => {
    ActivatePluginService.activateAll();
  }, []);


  const commonPageProps = pageProps as CommonProps;
  // useInterceptorManager(new InterceptorManager());
  useAppTitle(commonPageProps.appTitle);
  useSiteUrl(commonPageProps.siteUrl);
  useConfidential(commonPageProps.confidential);
  useGrowiVersion(commonPageProps.growiVersion);
  useCustomizedLogoSrc(commonPageProps.customizedLogoSrc);

  return (
    <SWRConfig value={swrConfig}>
      <Component {...pageProps} />
    </SWRConfig>
  );
}

// export default appWithTranslation(GrowiApp);

export default appWithTranslation(GrowiApp, nextI18nConfig);
