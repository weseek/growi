import 'bootstrap/dist/css/bootstrap.min.css';
import '~/styles/globals.scss';
import { AppProps } from 'next/app';
import Head from 'next/head';

import Layout from '~/components/Layout';

const App = ({ Component, pageProps }: AppProps): JSX.Element => (
  <>
    <Head>
      <title />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <Layout>
      <Component {...pageProps} />
    </Layout>
  </>
);

export default App;
