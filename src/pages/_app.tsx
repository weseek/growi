import { AppProps } from 'next/app';
import { Provider } from 'unstated';

import { appWithTranslation } from '~/i18n';
import AppContainer from '~/client/js/services/AppContainer';

import '../styles/styles.scss';
import '~/client/styles/scss/theme/default.scss';

import NavigationContainer from '~/client/js/services/NavigationContainer';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function GrowiApp({ Component, pageProps }: AppProps) {
  const appContainer = new AppContainer();
  appContainer.initApp();

  const navigationContainer = new NavigationContainer(appContainer);

  return (
    <Provider inject={[appContainer, navigationContainer]}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default appWithTranslation(GrowiApp);
