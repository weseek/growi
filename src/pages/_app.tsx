import { AppProps } from 'next/app';

import { appWithTranslation } from '~/i18n';

import '../styles/styles.scss';
import '~/client/styles/scss/theme/default.scss';
import InterceptorManager from '~/service/interceptor-manager';

import { useGrowiVersion } from '../stores/context';
import { useInterceptorManager } from '~/stores/interceptor';

function GrowiApp({ Component, pageProps }: AppProps) {
  useInterceptorManager(new InterceptorManager());
  useGrowiVersion(pageProps.growiVersion);

  return (
    <Component {...pageProps} />
  );
}

export default appWithTranslation(GrowiApp);
