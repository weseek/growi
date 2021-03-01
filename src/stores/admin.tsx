import useSWR, { responseInterface } from 'swr';
import { apiv3Get } from '~/client/js/util/apiv3-client';
import {
  appParams as IAppParams,
  markdownParams as IMarkdownParams,
  customizeParams as ICustomizeParams,
  securityParamsGeneralSetting as ISecurityParamsGeneralSetting,
} from '~/interfaces/admin';

export const useAppSettingsSWR = (): responseInterface<IAppParams, Error> => {
  return useSWR(
    '/app-settings',
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result.data.appSettingsParams),
    { revalidateOnFocus: false },
  );
};

export const useMarkdownSettingsSWR = (): responseInterface<IMarkdownParams, Error> => {
  return useSWR(
    '/markdown-setting',
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result.data.markdownParams),
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

export const useSecuritySettingGeneralSWR = (): responseInterface<ISecurityParamsGeneralSetting, Error> => {
  return useSWR(
    '/security-setting',
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result.data.securityParams.generalSetting),
    { revalidateOnFocus: false },
  );
};
