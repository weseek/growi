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

const convertToIDataWithMeta = (page) => {
  return { data: page };
};

const useEmptyTrashButton = () => {

  const { data: limit } = useShowPageLimitationXL();
  const { data: pagingResult, mutate: mutatePageLists } = useSWRxDescendantsPageListForCurrrentPath(1, limit);
  const { t } = useTranslation();
  const { open: openEmptyTrashModal } = useEmptyTrashModal();

  const pageIds = pagingResult?.items?.map(page => page._id);
  const { injectTo } = useSWRxPageInfoForList(pageIds, null, true, true);

  let pageWithMetas: IDataWithMeta<IPageHasId, IPageInfo>[] = [];

  if (pagingResult != null) {
    const dataWithMetas = pagingResult.items.map(page => convertToIDataWithMeta(page));
    pageWithMetas = injectTo(dataWithMetas);
  }

  const deletablePages = pageWithMetas.filter(page => page.meta?.isAbleToDeleteCompletely);

  const onEmptiedTrashHandler = useCallback(() => {
    toastSuccess(t('empty_trash'));

    mutatePageLists();
  }, [t, mutatePageLists]);

  const emptyTrashClickHandler = useCallback(() => {
    openEmptyTrashModal(deletablePages, { onEmptiedTrash: onEmptiedTrashHandler, canDeleteAllPages: pagingResult?.totalCount === deletablePages.length });
  }, [deletablePages, onEmptiedTrashHandler, openEmptyTrashModal, pagingResult?.totalCount]);

  const emptyTrashButtonForTrashPageList = useMemo(() => {
    return <EmptyTrashButton onEmptyTrashButtonClick={emptyTrashClickHandler} disableEmptyButton={deletablePages.length === 0} />;
  }, [emptyTrashClickHandler, deletablePages.length]);

  return emptyTrashButtonForTrashPageList;
};

export const TrashPageList: FC = () => {
  const { t } = useTranslation();
  const emptyTrashButtonForTrashPageList = useEmptyTrashButton();

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

  return (
    <div data-testid="trash-page-list" className="mt-5 d-edit-none">
      <CustomNavAndContents navTabMapping={navTabMapping} navRightElement={emptyTrashButtonForTrashPageList} />
    </div>
  );
};

TrashPageList.displayName = 'TrashPageList';
