import { AppProps } from 'next/app';
import { Provider } from 'unstated';

import { appWithTranslation } from '~/i18n';

import '../styles/styles.scss';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function GrowiApp({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  );
}

export default appWithTranslation(GrowiApp);
