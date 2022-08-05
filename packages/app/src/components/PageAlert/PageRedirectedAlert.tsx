import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';

import { useRedirectFrom } from '~/stores/context';

export const PageRedirectedAlert = React.memo((): JSX.Element => {
  const { t } = useTranslation();
  const { data: redirectFrom, mutate: mutateRedirectFrom } = useRedirectFrom();
  const [isUnlinked, setIsUnlinked] = useState(false);

  const unlinkButtonClickHandler = (): void => {
    // Todo: implement in https://redmine.weseek.co.jp/issues/101741
    setIsUnlinked(true);
    mutateRedirectFrom('');
  };

  if (redirectFrom == null) {
    return <></>;
  }

  if (isUnlinked) {
    return (<div className="alert alert-info d-edit-none py-3 px-4">
      <strong>{ t('Unlinked') }: </strong> { t('page_page.notice.unlinked') }
    </div>);
  }

  return (
    <div className="alert alert-pink d-edit-none py-3 px-4 d-flex align-items-center justify-content-between">
      <span>
        <strong>{ t('Redirected') }:</strong> { t('page_page.notice.redirected')} <code>{redirectFrom}</code> {t('page_page.notice.redirected_period')}
      </span>
      <button type="button" id="unlink-page-button" onClick={unlinkButtonClickHandler} className="btn btn-outline-dark btn-sm float-right">
        <i className="ti ti-unlink" aria-hidden="true"></i>
        {t('unlink_redirection')}
      </button>
    </div>
  );
});
PageRedirectedAlert.displayName = 'PageRedirectedAlert';
