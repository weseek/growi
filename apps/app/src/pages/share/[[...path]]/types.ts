import type { IShareLinkHasId } from '~/interfaces/share-link';

export type ShareLinkPageProps = {
  isNotFound: true,
  isExpired: undefined
  shareLink: undefined,
} | {
  isExpired: true,
  shareLink: undefined,
} | {
  isExpired: false,
  shareLink: IShareLinkHasId,
};
