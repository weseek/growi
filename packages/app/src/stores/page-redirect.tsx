import { SWRResponseWithUtils, withUtils } from '@growi/core/src/utils/with-utils';
import { SWRResponse } from 'swr';

import { apiPost } from '~/client/util/apiv1-client';

import { useCurrentPagePath } from './context';
import { useStaticSWR } from './use-static-swr';

type RedirectFromUtil = {
  unlink(): Promise<void>
}
export const useRedirectFrom = (initialData?: string): SWRResponseWithUtils<RedirectFromUtil, string> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const swrResponse: SWRResponse<string, Error> = useStaticSWR('redirectFrom', initialData);
  const utils = {
    unlink: async() => {
      if (currentPagePath == null) {
        return;
      }
      try {
        await apiPost('/pages.unlink', { path: currentPagePath });
        swrResponse.mutate('');
      }
      catch (err) {
        throw err;
      }
    },
  };
  return withUtils(swrResponse, utils);
};
