import { useCallback } from 'react';

import useSWR, { SWRResponse } from 'swr';

import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';
import { IResLayoutSetting } from '~/interfaces/customize';

interface updateConfigMethodForAdmin<T> {
  update: (arg: T) => void
}


export const useSWRxLayoutSetting = (): SWRResponse<IResLayoutSetting, Error> & updateConfigMethodForAdmin<IResLayoutSetting> => {

  const fetcher = useCallback(async() => {
    const res = await apiv3Get('/customize-setting/layout');
    return res.data;
  }, []);

  const update = useCallback(async(layoutSetting: IResLayoutSetting) => {
    await apiv3Put('/customize-setting/layout', layoutSetting);
  }, []);

  const swrResponse = useSWR('/customize-setting/layout', fetcher);

  return {
    ...swrResponse,
    update,
  };
};
