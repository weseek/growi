import React from 'react';

import { useTranslation } from 'react-i18next';

export const InAppNotification = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <div className="px-3">
      <div className="grw-sidebar-content-header py-3 d-flex">
        <h3 className="mb-0">
          {t('In-App Notification')}
        </h3>
      </div>
    </div>
  );
};
