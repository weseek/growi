import { useCallback } from 'react';

import type { IUserHasId } from '@growi/core';
import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

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

  const onEditorsUpdated = useCallback((userList: IUserHasId[]): void => {
    mutate({ userList });
  }, [mutate]);

  return {
    ...swrResponse,
    onEditorsUpdated,
  };
};
