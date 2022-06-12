import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

export const AuditLogSettings: FC = () => {
  const { t } = useTranslation();

  const adminAuditLogSettingsElm = document.getElementById('admin-audit-log-settings');
  const activityExpirationSeconds = adminAuditLogSettingsElm?.getAttribute('activity-expiration-seconds') || 2592000;

  return (
    <div data-testid="admin-auditlog-settings">
      <h3 className="mb-4">
        <a href="/admin/audit-log">
          <i className="icon-arrow-left" />
          {t('AuditLog')}
        </a>
      </h3>
      <h2 className="admin-setting-header mb-3">
        {t('AuditLog Settings')}
      </h2>
    </div>
  );
};
