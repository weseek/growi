import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useActivityExpirationSeconds } from '~/stores/context';

export const AuditLogSettings: FC = () => {
  const { t } = useTranslation();

  const { data: activityExpirationSecondsData } = useActivityExpirationSeconds();
  const activityExpirationSeconds = activityExpirationSecondsData != null ? activityExpirationSecondsData : 2592000;

  return (
    <>
      <h4>{t('admin:audit_log_management.activity_expiration_date')}</h4>
      <p className="form-text text-muted">
        {t('admin:audit_log_management.activity_expiration_date_explain')}
      </p>
      <p className="alert alert-warning col-6">
        <i className="icon-exclamation icon-fw">
        </i><b>FIXED</b><br />
        <b
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: t('admin:audit_log_management.fixed_by_env_var',
              { key: 'ACTIVITY_EXPIRATION_SECONDS', value: activityExpirationSeconds }),
          }}
        />
      </p>
    </>
  );
};
