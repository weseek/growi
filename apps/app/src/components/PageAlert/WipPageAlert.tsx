import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { useSWRMUTxCurrentPage, useSWRxCurrentPage } from '~/stores/page';

import { publish } from '../../client/services/page-operation';


export const WipPageAlert = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: currentPage } = useSWRxCurrentPage();
  const { trigger: mutateCurrentPage } = useSWRMUTxCurrentPage();

  const clickPagePublishButton = useCallback(async() => {
    if (currentPage?._id == null) {
      return;
    }

    await publish(currentPage._id);
    await mutateCurrentPage();
  }, [currentPage._id, mutateCurrentPage]);


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
