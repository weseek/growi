import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '~/client/util/toastr';
import { useSWRMUTxCurrentPage, useSWRxCurrentPage } from '~/stores/page';
import { mutatePageTree } from '~/stores/page-listing';

import { publish } from '../../client/services/page-operation';


export const WipPageAlert = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: currentPage } = useSWRxCurrentPage();
  const { trigger: mutateCurrentPage } = useSWRMUTxCurrentPage();

  const clickPagePublishButton = useCallback(async() => {
    const pageId = currentPage?._id;

    if (pageId == null) {
      return;
    }

    try {
      await publish(pageId);
      await mutateCurrentPage();
      await mutatePageTree();
      toastSuccess(t('wip_page.success_publish_page'));
    }
    catch {
      toastError(t('wip_page.fail_publish_page'));
    }
  }, [currentPage?._id, mutateCurrentPage, t]);


  if (!currentPage?.wip) {
    return <></>;
  }

  return (
    <p className="d-flex align-items-center alert alert-secondary py-3 px-4">
      <span className="material-symbols-outlined me-1 fs-5">info</span>
      <span>{t('wip_page.alert')}</span>
      <button
        type="button"
        className="btn btn-outline-secondary ms-auto"
        onClick={clickPagePublishButton}
      >
        {t('wip_page.publish_page') }
      </button>
    </p>
  );
};
