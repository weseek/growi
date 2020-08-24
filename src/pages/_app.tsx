import App, { AppProps, AppContext } from 'next/app';
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

GrowiApp.getInitialProps = async(appContext: AppContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);

  return { ...appProps };
};

export default appWithTranslation(GrowiApp);
