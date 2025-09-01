import type { IShareLinkHasId } from '~/interfaces/share-link';
import type { GeneralPageInitialProps } from '~/pages/general-page';

export type ShareLinkInitialProps = Pick<GeneralPageInitialProps, 'pageWithMeta' | 'skipSSR'> & (
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
