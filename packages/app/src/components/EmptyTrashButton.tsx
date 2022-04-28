import React from 'react';

import { useTranslation } from 'react-i18next';

import {
  IDataWithMeta,
  IPageHasId,
  IPageInfo,
} from '~/interfaces/page';
import { usePageDeleteModal } from '~/stores/modal';
import { useSWRxDescendantsPageListForCurrrentPath, useSWRxPageInfoForList } from '~/stores/page';


const EmptyTrashButton = () => {
  const { t } = useTranslation();
  const { open: openDeleteModal } = usePageDeleteModal();
  const { data: pagingResult } = useSWRxDescendantsPageListForCurrrentPath();

  const pageIds = pagingResult?.items?.map(page => page._id);
  const { injectTo } = useSWRxPageInfoForList(pageIds, true, true);

  let pageWithMetas: IDataWithMeta<IPageHasId, IPageInfo>[] = [];

  const convertToIDataWithMeta = (page) => {
    return { data: page };
  };

  if (pagingResult != null) {
    const dataWithMetas = pagingResult.items.map(page => convertToIDataWithMeta(page));
    pageWithMetas = injectTo(dataWithMetas);
  }

  const onDeletedHandler = (...args) => {
    // process after multipe pages delete api
  };

  const emptyTrashClickHandler = () => {
    openDeleteModal(pageWithMetas, { onDeleted: onDeletedHandler, emptyTrash: true });
  };

  return (
    <div className="d-flex align-items-center">
      <button
        type="button"
        className="btn btn-outline-secondary rounded-pill text-danger d-flex align-items-center"
        onClick={() => emptyTrashClickHandler()}
      >
        <i className="icon-fw icon-trash"></i>
        <div>{t('modal_delete.empty_trash')}</div>
      </button>
    </div>
  );
};

export default EmptyTrashButton;
