import { useCallback } from 'react';

import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';
import type { updateConfigMethodForAdmin } from '~/interfaces/admin';
import type { IResLayoutSetting, IResGrowiTheme } from '~/interfaces/customize';

export const useSWRxLayoutSetting = (): SWRResponse<IResLayoutSetting, Error> & updateConfigMethodForAdmin<IResLayoutSetting> => {

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

export const useSWRxGrowiTheme = (): SWRResponse<string, Error> => {

  const fetcher = useCallback(async() => {
    const res = await apiv3Get<IResGrowiTheme>('/customize-setting/theme');
    return res.data.theme;
  }, []);

  const swrResponse = useSWRImmutable('/customize-setting/theme', fetcher);

  const update = async(theme: string) => {
    await apiv3Put('/customize-setting/layout', { theme });
    await swrResponse.mutate();
    // The updateFn should be a promise or asynchronous function to handle the remote mutation
    // it should return updated data. see: https://swr.vercel.app/docs/mutation#optimistic-updates
    // Moreover, `async() => false` does not work since it's too fast to be calculated.
    await swrResponse.mutate(new Promise(r => setTimeout(() => r(theme), 10)), { optimisticData: () => theme });
  };

  return Object.assign(
    swrResponse,
    {
      update,
    },
  );
};
