import { SWRResponseWithUtils, withUtils } from '@growi/core/src/utils/with-utils';
import { SWRResponse } from 'swr';

import { apiPost } from '~/client/util/apiv1-client';

import { useCurrentPagePath } from './page';
import { useStaticSWR } from './use-static-swr';

type RedirectFromUtil = {
  unlink(path?: string): Promise<void>
}
export const useRedirectFrom = (initialData?: string): SWRResponseWithUtils<RedirectFromUtil, string> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const swrResponse: SWRResponse<string, Error> = useStaticSWR('redirectFrom', initialData);
  const utils = {
    unlink: async(path?: string) => {
      console.log({ path, currentPagePath });
      if (currentPagePath == null) {
        return;
      }

      const pathHoge = currentPagePath === '/trash' ? `/trash/${path}` : currentPagePath;
      try {
        await apiPost('/pages.unlink', { path: pathHoge });
        swrResponse.mutate('');
      }
      catch (err) {
        throw err;
      }
    },
  };
  return withUtils(swrResponse, utils);
};
