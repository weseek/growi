import { useCallback } from 'react';

import type { IApiv3PageUpdateParams, IApiv3PageUpdateResponse } from '~/interfaces/apiv3';
import { useIsUntitledPage } from '~/stores/ui';

import { updatePage } from './update-page';

type UseUpdatePage = (params: IApiv3PageUpdateParams) => Promise<IApiv3PageUpdateResponse>;

export const useUpdatePage = (): UseUpdatePage => {
  const { mutate: mutateUntitledPage } = useIsUntitledPage();

  const updatePageExt: UseUpdatePage = useCallback(
    async (params) => {
      const result = await updatePage(params);

      // set false to isUntitledPage
      mutateUntitledPage(false);

      return result;
    },
    [mutateUntitledPage],
  );

  return updatePageExt;
};
