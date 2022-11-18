import React from 'react';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { useIsLatestRevision } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';

export const OldRevisionAlert = (): JSX.Element => {

  const { t } = useTranslation();
  const { data: isLatestRevision } = useIsLatestRevision();
  const { data: page } = useSWRxCurrentPage();

  if (page == null || isLatestRevision == null || isLatestRevision) {
    return <></>;
  }

  const pathPath = page.path === '/' ? '/' : `/${page._id}`;

  return (
    <div className="alert alert-warning">
      <strong>{ t('Warning') }: </strong> { t('page_page.notice.version') }
      <Link href={pathPath}>
        <a><i className="icon-fw icon-arrow-right-circle"></i>{ t('Show latest') }</a>
      </Link>
    </div>
  );
};
