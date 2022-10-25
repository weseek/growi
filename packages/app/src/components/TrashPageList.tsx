import React, { FC, useMemo, useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess } from '~/client/util/apiNotification';
import {
  IDataWithMeta,
  IPageHasId,
  IPageInfo,
} from '~/interfaces/page';
import { useShowPageLimitationXL } from '~/stores/context';
import { useEmptyTrashModal } from '~/stores/modal';
import { useSWRxDescendantsPageListForCurrrentPath, useSWRxPageInfoForList } from '~/stores/page-listing';

import CustomNavAndContents from './CustomNavigation/CustomNavAndContents';
import { DescendantsPageListForCurrentPath } from './DescendantsPageList';
import EmptyTrashButton from './EmptyTrashButton';
import PageListIcon from './Icons/PageListIcon';

type EmptyTrashButtonOptions = {
  isButtonDisable: boolean,
  canDeleteAllPages: boolean,
  deletablePages: IDataWithMeta<IPageHasId, IPageInfo>[],
  mutatePageLists: () => void
}

const useEmptyTrashButton = (): EmptyTrashButtonOptions => {

  const { data: limit } = useShowPageLimitationXL();
  const { data: pagingResult, mutate } = useSWRxDescendantsPageListForCurrrentPath(1, limit);

  const pageIds = pagingResult?.items?.map(page => page._id);
  const { injectTo } = useSWRxPageInfoForList(pageIds, null, true, true);

  let pageWithMetas: IDataWithMeta<IPageHasId, IPageInfo>[] = [];

  const convertToIDataWithMeta = useCallback((page) => {
    return { data: page };
  }, []);

  if (pagingResult != null) {
    const dataWithMetas = pagingResult.items.map(page => convertToIDataWithMeta(page));
    pageWithMetas = injectTo(dataWithMetas);
  }

  const deletablePages = pageWithMetas.filter(page => page.meta?.isAbleToDeleteCompletely);

  return {
    isButtonDisable: deletablePages.length === 0,
    canDeleteAllPages: pagingResult?.totalCount === deletablePages.length,
    deletablePages,
    mutatePageLists: mutate,
  };
};

export const TrashPageList: FC = () => {
  const { t } = useTranslation();
  const { open: openEmptyTrashModal } = useEmptyTrashModal();
  const {
    isButtonDisable, canDeleteAllPages, deletablePages, mutatePageLists,
  } = useEmptyTrashButton();

  const navTabMapping = useMemo(() => {
    return {
      pagelist: {
        Icon: PageListIcon,
        Content: DescendantsPageListForCurrentPath,
        i18n: t('page_list'),
        index: 0,
      },
    };
  }, [t]);

  const onEmptiedTrashHandler = useCallback(() => {
    toastSuccess(t('empty_trash'));

    mutatePageLists();
  }, [t, mutatePageLists]);

  const emptyTrashClickHandler = useCallback(() => {
    openEmptyTrashModal(deletablePages, { onEmptiedTrash: onEmptiedTrashHandler, canDeleteAllPages });
  }, [deletablePages, onEmptiedTrashHandler, openEmptyTrashModal, canDeleteAllPages]);

  const emptyTrashButton = useMemo(() => {
    return <EmptyTrashButton emptyTrashClickHandler={emptyTrashClickHandler} disableEmptyButton={isButtonDisable} />;
  }, [emptyTrashClickHandler, isButtonDisable]);

  return (
    <div data-testid="trash-page-list" className="mt-5 d-edit-none">
      <CustomNavAndContents navTabMapping={navTabMapping} navRightElement={emptyTrashButton} />
    </div>
  );
};

TrashPageList.displayName = 'TrashPageList';
