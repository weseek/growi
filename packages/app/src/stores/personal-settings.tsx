import useSWR, { SWRResponse } from 'swr';

import { IExternalAccount } from '~/interfaces/external-account';
import { IUser } from '~/interfaces/user';

import { apiv3Get, apiv3Put } from '../client/util/apiv3-client';

import { useStaticSWR } from './use-static-swr';


export const useSWRxPersonalSettings = (): SWRResponse<IUser, Error> => {
  return useSWR(
    '/personal-setting',
    endpoint => apiv3Get(endpoint).then(response => response.data.currentUser),
  );
};

export type IPersonalSettingsInfoOption = {
  sync: () => void,
  updateBasicInfo: () => void,
}

export const usePersonalSettings = (): SWRResponse<IUser, Error> & IPersonalSettingsInfoOption => {
  const { data: personalSettingsDataFromDB } = useSWRxPersonalSettings();

  const key = personalSettingsDataFromDB != null ? 'personalSettingsInfo' : null;

  const swrResult = useStaticSWR<IUser, Error>(key, undefined, { fallbackData: personalSettingsDataFromDB });

  return {
    ...swrResult,

    // Sync with database
    sync: (): void => {
      const { mutate } = swrResult;
      mutate(personalSettingsDataFromDB);
    },
    updateBasicInfo: () => {
      const { data } = swrResult;

      if (data == null) {
        return;
      }

      const updateData = {
        name: data.name,
        email: data.email,
        isEmailPublished: data.isEmailPublished,
        lang: data.lang,
        slackMemberId: data.slackMemberId,
      };

      // invoke API
      apiv3Put('/personal-setting/', updateData);
    },
  };
};

export const useSWRxPersonalExternalAccounts = (): SWRResponse<IExternalAccount[], Error> => {
  return useSWR(
    '/personal-setting/external-accounts',
    endpoint => apiv3Get(endpoint).then(response => response.data.externalAccounts),
  );
};
