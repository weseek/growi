import type { SWRResponse } from 'swr';

import { IUserHasId } from '..';

import { useSWRStatic } from './use-swr-static';

type EditingUsersStatus = {
  userList: IUserHasId[],
}

type EditingUsersStatusUtils = {
  onEditorsUpdated(
    userList: IUserHasId[],
  ): void,
}

export const useEditingUsers = (status?: EditingUsersStatus): SWRResponse<EditingUsersStatus, Error> & EditingUsersStatusUtils => {
  const initialData: EditingUsersStatus = {
    userList: [],
  };
  const swrResponse = useSWRStatic<EditingUsersStatus, Error>('editingUsers', status, { fallbackData: initialData });

  const { mutate } = swrResponse;

  const onEditorsUpdated = (userList: IUserHasId[]): void => {
    mutate({ userList });
  };

  return {
    ...swrResponse,
    onEditorsUpdated,
  };
};
