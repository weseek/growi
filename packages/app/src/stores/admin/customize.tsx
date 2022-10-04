import { useCallback } from 'react';

import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';


type IResLayoutSetting = {
  isContainerFluid: boolean,
};

export const useSWRxLayoutSetting = (fallbackData?: IResLayoutSetting): SWRResponse<IResLayoutSetting, Error> => {
  const fetcher = useCallback(async() => {
    const res = await apiv3Get('/customize-setting/layout');

    return res.data;
  }, []);

  return useSWR(
    '/customize-setting/layout',
    fetcher,
    { fallbackData },
  );
};
