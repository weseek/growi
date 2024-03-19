import React from 'react';

import { returnPathForURL } from '@growi/core/dist/utils/path-utils';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { useIsOldRevisionPage } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';

export const OldRevisionAlert = (): JSX.Element => {

  const { t } = useTranslation();
  const { data: page } = useSWRxCurrentPage();
  const { data: isOldRevisionPage } = useIsOldRevisionPage();

  if (page == null || !isOldRevisionPage) {
    return <></>;
  }

  return (
    <div className="alert alert-warning">
      <strong>{t('Warning')}: </strong> {t('page_page.notice.version')}
      <Link href={returnPathForURL(page.path, page._id)}>
        <span className="material-symbols-outlined me-1">arrow_circle_right</span>{t('Show latest')}
      </Link>
    </div>
  );
};
