import React, { FC } from 'react';

export const AuditLogSettings: FC = () => {
  const adminAuditLogSettingsElm = document.getElementById('admin-audit-log-settings');
  const activityExpirationSeconds = adminAuditLogSettingsElm?.getAttribute('activity-expiration-seconds') || 2592000;


  return (
    <>AuditLog Settings</>
  );
};
