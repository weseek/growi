import useSWR, { SWRResponse } from 'swr';


import { Nullable } from '~/interfaces/common';
import { IExternalAccount } from '~/interfaces/external-account';
import { IUser } from '~/interfaces/user';

import { apiv3Get } from '../client/util/apiv3-client';

import { useStaticSWR } from './use-static-swr';


export const useSWRxPersonalSettings = (): SWRResponse<IUser, Error> => {
  return useSWR(
    '/personal-setting',
    endpoint => apiv3Get(endpoint).then(response => response.data.currentUser),
  );
};

export type IPersonalSettingsInfoOption = {
  personalSettingsDataFromDB: Nullable<IUser>,
  sync: () => void;
}

export const usePersonalSettings = (): SWRResponse<IUser, Error> & IPersonalSettingsInfoOption => {
  const { data: personalSettingsDataFromDB } = useSWRxPersonalSettings();

  const swrResult = useStaticSWR<IUser, Error>('personalSettingsInfo', undefined);

  return {
    ...swrResult,
    personalSettingsDataFromDB,

    // Sync with database
    sync: (): void => {
      const { mutate } = swrResult;
      mutate(personalSettingsDataFromDB);
    },
  };
};

export const useSWRxPersonalExternalAccounts = (): SWRResponse<IExternalAccount[], Error> => {
  return useSWR(
    '/personal-setting/external-accounts',
    endpoint => apiv3Get(endpoint).then(response => response.data.externalAccounts),
  );
};
