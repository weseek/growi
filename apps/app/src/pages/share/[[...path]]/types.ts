import type { IShareLinkHasId } from '~/interfaces/share-link';
import type { InitialProps } from '~/pages/general-page';

export type ShareLinkInitialProps = Pick<InitialProps, 'pageWithMeta' | 'skipSSR'> & (
  {
    isNotFound: true,
    isExpired: undefined,
    shareLink: undefined,
  } | {
    isNotFound: false,
    isExpired: true,
    shareLink: IShareLinkHasId,
  } | {
    isNotFound: false,
    isExpired: false,
    shareLink: IShareLinkHasId,
  }
);
