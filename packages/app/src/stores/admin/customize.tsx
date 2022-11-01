import { useCallback } from 'react';

import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';
import { updateConfigMethodForAdmin } from '~/interfaces/admin';
import { IResLayoutSetting } from '~/interfaces/customize';

export const useSWRxLayoutSetting = (): SWRResponse<IResLayoutSetting, Error> & updateConfigMethodForAdmin<IResLayoutSetting, void> => {

  const fetcher = useCallback(async() => {
    const res = await apiv3Get('/customize-setting/layout');
    return res.data;
  }, []);

  const swrResponse = useSWRImmutable('/customize-setting/layout', fetcher);

  const update = useCallback(async(layoutSetting: IResLayoutSetting) => {
    await apiv3Put('/customize-setting/layout', layoutSetting);
    await swrResponse.mutate();
  }, [swrResponse]);

  return {
    ...swrResponse,
    update,
  };
};
