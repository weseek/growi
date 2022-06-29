import useSWR, { mutate, SWRResponse } from 'swr';

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
  updateBasicInfo: () => Promise<void>,
  associateLdapAccount: (account: { username: string, password: string }) => Promise<void>,
}

export const usePersonalSettings = (): SWRResponse<IUser, Error> & IPersonalSettingsInfoOption => {
  const { data: personalSettingsDataFromDB, mutate: revalidate } = useSWRxPersonalSettings();
  const key = personalSettingsDataFromDB != null ? 'personalSettingsInfo' : null;

  const swrResult = useStaticSWR<IUser, Error>(key, undefined, { fallbackData: personalSettingsDataFromDB });

  // Sync with database
  const sync = async(): Promise<void> => {
    const { mutate } = swrResult;
    const result = await revalidate();
    mutate(result);
  };

  const updateBasicInfo = async(): Promise<void> => {
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
    await apiv3Put('/personal-setting/', updateData);
  };


  const associateLdapAccount = async(account): Promise<void> => {
    await apiv3Put('/personal-setting/associate-ldap', account);
  };

  return {
    ...swrResult,
    sync,
    updateBasicInfo,
    associateLdapAccount,
  };
};

export const useSWRxPersonalExternalAccounts = (): SWRResponse<IExternalAccount[], Error> => {
  return useSWR(
    '/personal-setting/external-accounts',
    endpoint => apiv3Get(endpoint).then(response => response.data.externalAccounts),
  );
};
