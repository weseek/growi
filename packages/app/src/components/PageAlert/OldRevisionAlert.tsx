import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentPageId } from '~/stores/context';
import { useSWRxPageInfo } from '~/stores/page';

export const OldRevisionAlert = (): JSX.Element => {

  const { t } = useTranslation()
  const { data: currentPageId } = useCurrentPageId();
  const { data: pageInfo } = useSWRxPageInfo(currentPageId);

  if (pageInfo == null || pageInfo.isLatestRevision) {
    return <></>
  }

  return (
    <div className="alert alert-warning">
      <strong>{ t('Warning') }: </strong> { t('page_page.notice.version') }
      <a href="{ encodeURI(page.path) }"><i className="icon-fw icon-arrow-right-circle"></i>{ t('Show latest') }</a>
    </div>
  );
};
