import { AppProps } from 'next/app';

import { appWithTranslation } from '~/i18n';

import '../styles/styles.scss';
import '~/client/styles/scss/theme/default.scss';
import InterceptorManager from '~/service/interceptor-manager';

import { useGrowiVersion } from '../stores/context';
import { useInterceptorManager } from '~/stores/interceptor';

import GrowiNavBar from '../client/js/components/Navbar/GrowiNavbar'

function GrowiApp({ Component, pageProps }: AppProps) {
  useInterceptorManager(new InterceptorManager());
  useGrowiVersion(pageProps.growiVersion);

  return (
    <>
      <GrowiNavBar />
      <Component {...pageProps} />
    </>
  );
}

export default appWithTranslation(GrowiApp);
