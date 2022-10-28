import React, { FC, useMemo, useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess } from '~/client/util/apiNotification';
import {
  IPageHasId,
} from '~/interfaces/page';
import { IPagingResult } from '~/interfaces/paging-result';
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

  const calculateDeletablePages = useCallback((pagingResult?: IPagingResult<IPageHasId>) => {
    if (pagingResult == null) { return undefined }

    const dataWithMetas = pagingResult.items.map(page => convertToIDataWithMeta(page));
    const pageWithMetas = injectTo(dataWithMetas);

    return pageWithMetas.filter(page => page.meta?.isAbleToDeleteCompletely);
  }, [injectTo]);

  const deletablePages = calculateDeletablePages(pagingResult);

  const onEmptiedTrashHandler = useCallback(() => {
    toastSuccess(t('empty_trash'));

    mutatePageLists();
  }, [t, mutatePageLists]);

  const emptyTrashClickHandler = useCallback(() => {
    if (deletablePages == null) { return }
    openEmptyTrashModal(deletablePages, { onEmptiedTrash: onEmptiedTrashHandler, canDeleteAllPages: pagingResult?.totalCount === deletablePages.length });
  }, [deletablePages, onEmptiedTrashHandler, openEmptyTrashModal, pagingResult?.totalCount]);

  const emptyTrashButton = useMemo(() => {
    return <EmptyTrashButton onEmptyTrashButtonClick={emptyTrashClickHandler} disableEmptyButton={deletablePages?.length === 0} />;
  }, [emptyTrashClickHandler, deletablePages?.length]);

  return emptyTrashButton;
};

export const TrashPageList: FC = () => {
  const { t } = useTranslation();
  const emptyTrashButton = useEmptyTrashButton();

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
    <div id="trash-page-list" className="mt-5 d-edit-none">
      <CustomNavAndContents navTabMapping={navTabMapping} navRightElement={emptyTrashButton} />
    </div>
  );
};

TrashPageList.displayName = 'TrashPageList';
