import React, { useEffect } from 'react';

import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';

import '~/styles/style-next.scss';
import '~/styles/theme/default.scss';
// import InterceptorManager from '~/service/interceptor-manager';

import * as nextI18nConfig from '../next-i18next.config';
import { useI18nextHMR } from '../services/i18next-hmr';
import { useGrowiVersion } from '../stores/context';

import { CommonProps } from './commons';
// import { useInterceptorManager } from '~/stores/interceptor';

const isDev = process.env.NODE_ENV === 'development';

type GrowiAppProps = AppProps & {
  pageProps: CommonProps;
};

function GrowiApp({ Component, pageProps }: GrowiAppProps): JSX.Element {
  useI18nextHMR(isDev);

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
  }, []);

  const commonPageProps = pageProps as CommonProps;
  // useInterceptorManager(new InterceptorManager());
  useGrowiVersion(commonPageProps.growiVersion);

  return (
    <Component {...pageProps} />
  );
}

// export default appWithTranslation(GrowiApp);

export default appWithTranslation(GrowiApp, nextI18nConfig);
