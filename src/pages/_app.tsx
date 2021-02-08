import { AppProps } from 'next/app';

import { appWithTranslation } from '~/i18n';

import '../styles/styles.scss';
import '~/client/styles/scss/theme/default.scss';

import { useGrowiVersion } from '../stores/context';

function GrowiApp({ Component, pageProps }: AppProps) {
  useGrowiVersion(pageProps.growiVersion);

  return (
    <Component {...pageProps} />
  );
}

export default appWithTranslation(GrowiApp);
