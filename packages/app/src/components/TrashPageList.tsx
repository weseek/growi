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


export const TrashPageList: FC = () => {
  const { t } = useTranslation();
  const { data: limit } = useShowPageLimitationXL();
  const { data: pagingResult, mutate } = useSWRxDescendantsPageListForCurrrentPath(1, limit);
  const { open: openEmptyTrashModal } = useEmptyTrashModal();

  const pageIds = pagingResult?.items?.map(page => page._id);
  const { injectTo } = useSWRxPageInfoForList(pageIds, null, true, true);

  let pageWithMetas: IDataWithMeta<IPageHasId, IPageInfo>[] = [];

  const convertToIDataWithMeta = (page) => {
    return { data: page };
  };

  if (pagingResult != null) {
    const dataWithMetas = pagingResult.items.map(page => convertToIDataWithMeta(page));
    pageWithMetas = injectTo(dataWithMetas);
  }

  const deletablePages = pageWithMetas.filter(page => page.meta?.isAbleToDeleteCompletely);

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

    mutate();
  }, [t, mutate]);

  const emptyTrashClickHandler = useCallback(() => {
    openEmptyTrashModal(deletablePages, { onEmptiedTrash: onEmptiedTrashHandler, canDelepeAllPages: pagingResult?.totalCount === deletablePages.length });
  }, [deletablePages, onEmptiedTrashHandler, openEmptyTrashModal, pagingResult?.totalCount]);

  const emptyTrashButton = useMemo(() => {
    return <EmptyTrashButton emptyTrashClickHandler={emptyTrashClickHandler} disableEmptyButton={deletablePages.length === 0} />;
  }, [emptyTrashClickHandler, deletablePages.length]);

  return (
    <div data-testid="trash-page-list" className="mt-5 d-edit-none">
      <CustomNavAndContents navTabMapping={navTabMapping} navRightElement={emptyTrashButton} />
    </div>
  );
};

TrashPageList.displayName = 'TrashPageList';
