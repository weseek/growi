import { useCallback } from 'react';

import useSWR, { SWRResponse } from 'swr';
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

type UpdateThemeArgs = {
  theme: string,
}
export const useSWRxGrowiThemeSetting = (): SWRResponse<IResGrowiTheme, Error> & updateConfigMethodForAdmin<UpdateThemeArgs> => {

  const fetcher = useCallback(async() => {
    const res = await apiv3Get<IResGrowiTheme>('/customize-setting/theme');
    return res.data;
  }, []);

  const swrResponse = useSWR('/customize-setting/theme', fetcher);

  const update = async({ theme }: UpdateThemeArgs) => {

    await apiv3Put('/customize-setting/theme', { theme });

    if (swrResponse.data == null) {
      swrResponse.mutate();
      return;
    }

    const newData = { ...swrResponse.data, currentTheme: theme };
    // The updateFn should be a promise or asynchronous function to handle the remote mutation
    // it should return updated data. see: https://swr.vercel.app/docs/mutation#optimistic-updates
    // Moreover, `async() => false` does not work since it's too fast to be calculated.
    await swrResponse.mutate(new Promise(r => setTimeout(() => r(newData), 10)), { optimisticData: () => newData });
  };

  return Object.assign(
    swrResponse,
    {
      update,
    },
  );
};
