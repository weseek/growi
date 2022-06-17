import React from 'react';

import { AppProps } from 'next/app';

// import { appWithTranslation } from '~/i18n';

import '~/styles/style-app.scss';
import '~/styles/theme/default.scss';
// import InterceptorManager from '~/service/interceptor-manager';

// import { useGrowiVersion } from '../stores/context';
// import { useInterceptorManager } from '~/stores/interceptor';

function GrowiApp({ Component, pageProps }: AppProps): JSX.Element {
  // useInterceptorManager(new InterceptorManager());
  // useGrowiVersion(pageProps.growiVersion);

  return (
    <Component {...pageProps} />
  );
}

// export default appWithTranslation(GrowiApp);

export default GrowiApp;
