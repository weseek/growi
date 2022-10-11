import { useCallback } from 'react';

import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IResLayoutSetting } from '~/interfaces/customize';

import { useLayoutSetting } from '../context';


export const useSWRxLayoutSetting = (fallbackData?: IResLayoutSetting): SWRResponse<IResLayoutSetting, Error> => {
  const { mutate: mutateStatic } = useLayoutSetting();

  const fetcher = useCallback(async() => {
    const res = await apiv3Get('/customize-setting/layout');

    mutateStatic(res.data);

    return res.data;
  }, [mutateStatic]);

  return useSWR(
    '/customize-setting/layout',
    fetcher,
    { fallbackData },
  );
};
