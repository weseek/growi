import { useCallback } from 'react';

import { Origin } from '@growi/core';
import { userHomepagePath } from '@growi/core/dist/utils/page-path-utils';
import { format } from 'date-fns/format';
import { useTranslation } from 'react-i18next';

import { useCreatePageAndTransit } from '~/client/services/create-page';
import { apiv3Get } from '~/client/util/apiv3-client';
import { useCurrentUser } from '~/stores/context';


type UseCreateTodaysMemo = () => {
  isCreating: boolean,
  todaysPath: string | null,
  createTodaysMemo: () => Promise<void>,
}

export const useCreateTodaysMemo: UseCreateTodaysMemo = () => {
  const { t } = useTranslation('commons');

  const { data: currentUser } = useCurrentUser();
  const { isCreating, createAndTransit } = useCreatePageAndTransit();

  const isCreatable = currentUser != null;

  const parentDirName = t('create_page_dropdown.todays.memo');
  const now = format(new Date(), 'yyyy/MM/dd');
  const todaysPath = isCreatable
    ? `${userHomepagePath(currentUser)}/${parentDirName}/${now}`
    : null;

  const createTodaysMemo = useCallback(async() => {
    if (!isCreatable || todaysPath == null) return;

    const res = await apiv3Get('/page/non-empty-closest-ancestor', { path: todaysPath });
    const parentPath = res.data.nonEmptyClosestAncestor?.path;

    return createAndTransit(
      {
        path: todaysPath, parentPath, wip: true, origin: Origin.View,
      },
      { shouldCheckPageExists: true },
    );
  }, [createAndTransit, isCreatable, todaysPath]);

  return {
    isCreating,
    todaysPath,
    createTodaysMemo,
  };
};
