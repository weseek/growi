import React from 'react';

import DefaultErrorPage from 'next/error';
import { useTranslation } from 'react-i18next';


export default function Page403() {
  const { t } = useTranslation('commons');

  const errorMessage = t('forbidden_page.do_not_have_admin_permission', { ns: 'commons' });

  return (
    <>
      <DefaultErrorPage statusCode={403} title={errorMessage} />
    </>
  );
}
