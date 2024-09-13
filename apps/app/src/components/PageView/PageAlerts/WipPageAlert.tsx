import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { useSWRMUTxCurrentPage, useSWRxCurrentPage } from '~/stores/page';
import { useSWRINFxRecentlyUpdated } from '~/stores/page-listing';

export const WipPageAlert = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: currentPage } = useSWRxCurrentPage();
  const { trigger: mutateCurrentPage } = useSWRMUTxCurrentPage();
  const { mutate: mutateRecentlyUpdated } = useSWRINFxRecentlyUpdated(20, true);


  const clickPagePublishButton = useCallback(async() => {
    const pageId = currentPage?._id;

    if (pageId == null) {
      return;
    }

    try {
      const publish = (await import('~/client/services/page-operation')).publish;
      await publish(pageId);

      await mutateCurrentPage();

      const mutatePageTree = (await import('~/stores/page-listing')).mutatePageTree;
      await mutatePageTree();

      await mutateRecentlyUpdated();

      const toastSuccess = (await import('~/client/util/toastr')).toastSuccess;
      toastSuccess(t('wip_page.success_publish_page'));
    }
    catch {
      const toastError = (await import('~/client/util/toastr')).toastError;
      toastError(t('wip_page.fail_publish_page'));
    }
  }, [currentPage?._id, mutateCurrentPage, t, mutateRecentlyUpdated]);


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
