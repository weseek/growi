import useSWR, { responseInterface } from 'swr';
import { apiv3Get } from '~/client/js/util/apiv3-client';
import { customizeParams as ICustomizeParams } from '~/interfaces/admin';

export const useAppSettingsSWR = (): responseInterface<ICustomizeParams, Error> => {
  return useSWR(
    '/app-setting',
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result.data.appParams),
    { revalidateOnFocus: false },
  );
};

export const useCustomizeSettingsSWR = (): responseInterface<ICustomizeParams, Error> => {
  return useSWR(
    '/customize-setting',
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result.data.customizeParams),
    { revalidateOnFocus: false },
  );
};
