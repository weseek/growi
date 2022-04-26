import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation, useTranslation } from 'react-i18next';

import { usePageDeleteModal } from '~/stores/modal';
import { useSWRxDescendantsPageListForCurrrentPath, useSWRxPageInfoForList } from '~/stores/page';

import CustomNavAndContents from './CustomNavigation/CustomNavAndContents';
import { DescendantsPageListForCurrentPath } from './DescendantsPageList';
import PageListIcon from './Icons/PageListIcon';


const EmptyTrashButton = () => {
  const { t } = useTranslation();
  const { open: openDeleteModal } = usePageDeleteModal();
  const { data: pagingResult } = useSWRxDescendantsPageListForCurrrentPath();

  const pageIds = pagingResult?.items?.map(page => page._id);
  const { injectTo } = useSWRxPageInfoForList(pageIds, true, true);

  let pageWithMetas = [];

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


const TrashPageList = (props) => {
  const { t } = props;

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
      <CustomNavAndContents navTabMapping={navTabMapping} navRightElement={EmptyTrashButton()} />
    </div>
  );
};

TrashPageList.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
};

export default withTranslation()(TrashPageList);
