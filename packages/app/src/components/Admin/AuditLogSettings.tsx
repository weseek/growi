import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useActivityExpirationSeconds } from '~/stores/context';

export const AuditLogSettings: FC = () => {
  const { t } = useTranslation();

  const { data: activityExpirationSecondsData } = useActivityExpirationSeconds();
  const activityExpirationSeconds = activityExpirationSecondsData != null ? activityExpirationSecondsData : 2592000;

  return (
    <div data-testid="admin-auditlog-settings">
      <h3 className="mb-4">
        <a href="/admin/audit-log">
          <i className="icon-arrow-left" />
          {t('AuditLog')}
        </a>
      </h3>

      <h2 className="admin-setting-header mb-4">
        {t('AuditLog Settings')}
      </h2>

      <h4>{t('admin:audit_log_settings.activity_expiration_date')}</h4>
      <p className="form-text text-muted">
        {t('admin:audit_log_settings.activity_expiration_date_explain')}
      </p>
      <p className="alert alert-warning">
        <i className="icon-exclamation icon-fw">
        </i><b>FIXED</b><br />
        <b
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: t('admin:audit_log_settings.fixed_by_env_var',
              { key: 'ACTIVITY_EXPIRATION_SECONDS', value: activityExpirationSeconds }),
          }}
        />
      </p>
    </div>
  );
};
