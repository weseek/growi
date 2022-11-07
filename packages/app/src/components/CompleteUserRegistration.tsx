import React, { FC } from 'react';

import { useTranslation } from 'next-i18next';

export const CompleteUserRegistration: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="noLogin-dialog mx-auto" id="noLogin-dialog">
      <div className="row mx-0">
        <div className="col-12 mb-3 text-center">
          <p className="alert alert-success">
            <span>{t('login.Registration successful')}</span>
          </p>
          <span>{t('login.wait_for_admin_approval')}</span>
        </div>
      </div>
    </div>
  );
};
