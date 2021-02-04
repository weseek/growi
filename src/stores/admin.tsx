import useSWR, { responseInterface } from 'swr';
import { apiv3Get } from '~/client/js/util/apiv3-client';
import {
  adminHomeParams as IAdminHomeParams,
  customizeParams as ICustomizeParams,
} from '~/interfaces/admin';


export const useAdminHomeSWR = (): responseInterface<IAdminHomeParams, Error> => {
  return useSWR(
    '/admin-home',
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result.data.adminHomeParams),
    {
      initialData: {
        growiVersion: '-',
        nodeVersion: '-',
        npmVersion: '-',
        yarnVersion: '-',
        installedPlugins: [],
        envVars: [],
      },
      revalidateOnFocus: false,
    },
  );
};

export const useCustomizeSettingsSWR = (): responseInterface<ICustomizeParams, Error> => {
  return useSWR(
    '/customize-setting',
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result.data.customizeParams),
    { revalidateOnFocus: false },
  );
};
