import { isServer } from '@growi/core/dist/utils';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { SSRConfig } from 'next-i18next';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { PageDocument } from '~/server/models/page';

import { createNextI18NextConfig } from '../[[...path]]/common-helpers';


const skipSSR = async(page: PageDocument, ssrMaxRevisionBodyLength: number): Promise<boolean> => {
  if (!isServer()) {
    throw new Error('This method is not available on the client-side');
  }

  const latestRevisionBodyLength = await page.getLatestRevisionBodyLength();

  if (latestRevisionBodyLength == null) {
    return true;
  }

  return ssrMaxRevisionBodyLength < latestRevisionBodyLength;
};

export type SSRProps = SSRConfig & {
  skipSSR: boolean;
}

export const getServerSideSSRProps = async(
    context: GetServerSidePropsContext,
    page: PageDocument,
    namespacesRequired?: string[] | undefined,
): Promise<GetServerSidePropsResult<SSRProps>> => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { configManager } = crowi;

  // Use the shared helper function instead of the local one
  const nextI18NextConfig = await createNextI18NextConfig(context, namespacesRequired);

  const ssrMaxRevisionBodyLength = configManager.getConfig('app:ssrMaxRevisionBodyLength');

  return {
    props: {
      _nextI18Next: nextI18NextConfig._nextI18Next,
      skipSSR: await skipSSR(page, ssrMaxRevisionBodyLength),
    },
  };
};
