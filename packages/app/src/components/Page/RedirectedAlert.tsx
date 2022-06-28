import React from 'react';

import { useTranslation } from 'react-i18next';

const RedirectedAlert = React.memo((): JSX.Element => {
  const { t } = useTranslation();
  const urlParams = new URLSearchParams(window.location.search);
  const fromPath = urlParams.get('redirectFrom');

  return (
    <>
      <strong>{ t('Redirected') }:</strong> { t('page_page.notice.redirected')} <code>{fromPath}</code> {t('page_page.notice.redirected_period')}
    </>
  );
});
RedirectedAlert.displayName = 'RedirectedAlert';

export default RedirectedAlert;
