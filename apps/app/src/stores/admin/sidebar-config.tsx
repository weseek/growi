import type { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';
import type { ISidebarConfig } from '~/interfaces/sidebar-config';

type SidebarConfigOption = {
  update: () => Promise<void>,
  isSidebarCollapsedMode: boolean|undefined,
  setIsSidebarCollapsedMode: (isSidebarCollapsedMode: boolean) => void,
}

export const useSWRxSidebarConfig = (): SWRResponse<ISidebarConfig, Error> & SidebarConfigOption => {
  const swrResponse = useSWRImmutable<ISidebarConfig>(
    '/customize-setting/sidebar',
    endpoint => apiv3Get<ISidebarConfig>(endpoint).then(result => result.data),
  );
  return {
    ...swrResponse,
    update: async() => {
      const { data } = swrResponse;

      if (data == null) {
        return;
      }

      const { isSidebarCollapsedMode } = data;

      const updateData = {
        isSidebarCollapsedMode,
      };

      // invoke API
      await apiv3Put('/customize-setting/sidebar', updateData);
    },
    isSidebarCollapsedMode: swrResponse.data?.isSidebarCollapsedMode,
    setIsSidebarCollapsedMode: (isSidebarCollapsedMode) => {
      const { data, mutate } = swrResponse;

      if (data == null) {
        return;
      }

      const updateData = {
        isSidebarCollapsedMode,
      };

      // update isSidebarCollapsedMode in cache, not revalidate
      mutate({ ...data, ...updateData }, false);
    },
  };
};
