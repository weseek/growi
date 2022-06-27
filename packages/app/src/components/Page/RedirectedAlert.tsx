import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

type Props = {

}

const RedirectedAlert: FC<Props> = () => {
  const { t } = useTranslation();
  const urlParams = new URLSearchParams(window.location.search);
  const fromPath = urlParams.get('redirectFrom');

  return (
    <>
      <strong>{ t('Redirected') }:</strong> { t('page_page.notice.redirected')} <code>{fromPath}</code> {t('page_page.notice.redirected_period')}
    </>
  );
};

export default RedirectedAlert;
