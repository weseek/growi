import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { SSRConfig } from 'next-i18next';

import { createNextI18NextConfig } from '../general-page/common-helpers';

export const getServerSideI18nProps = async(
    context: GetServerSidePropsContext,
    namespacesRequired?: string[] | undefined,
): Promise<GetServerSidePropsResult<SSRConfig>> => {
  // Use the shared helper function instead of the local one
  const nextI18NextConfig = await createNextI18NextConfig(context, namespacesRequired);

  return {
    props: {
      _nextI18Next: nextI18NextConfig._nextI18Next,
    },
  };
};
