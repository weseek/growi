import React from 'react';

import { AppProps } from 'next/app';

// import { appWithTranslation } from '~/i18n';

import '~/styles/style-next.scss';
import '~/styles/theme/default.scss';
// import InterceptorManager from '~/service/interceptor-manager';

import { useGrowiVersion } from '../stores/context';

import { CommonProps } from './commons';
// import { useInterceptorManager } from '~/stores/interceptor';

// modified version - allows for custom pageProps type
// see: https://stackoverflow.com/a/67464299
type GrowiAppProps<P> = {
  pageProps: P;
} & Omit<AppProps<P>, 'pageProps'>;

function GrowiApp({ Component, pageProps }: GrowiAppProps<CommonProps>): JSX.Element {
  // useInterceptorManager(new InterceptorManager());
  useGrowiVersion(pageProps.growiVersion);

  return (
    <Component {...pageProps} />
  );
}

// export default appWithTranslation(GrowiApp);

export default GrowiApp;
