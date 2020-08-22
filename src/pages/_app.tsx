import App, { AppProps, AppContext } from 'next/app';

import nextI18Next from '~/i18n';

import '../styles/styles.scss';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function GrowiApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

GrowiApp.getInitialProps = async(appContext: AppContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);

  return { ...appProps };
};

export default nextI18Next.appWithTranslation(GrowiApp);
