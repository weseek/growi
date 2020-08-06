import { AppProps } from 'next/app';
import '../styles/styles.scss';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function GrowiApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default GrowiApp;
