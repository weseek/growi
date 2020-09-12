import { AppProps } from 'next/app';
import { Provider } from 'unstated';

import { appWithTranslation } from '~/i18n';
import AppContainer from '~/client/js/services/AppContainer';

import '../styles/styles.scss';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function GrowiApp({ Component, pageProps }: AppProps) {
  const appContainer = new AppContainer();
  appContainer.initApp();

  return (
    <Provider inject={[appContainer]}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default appWithTranslation(GrowiApp);
