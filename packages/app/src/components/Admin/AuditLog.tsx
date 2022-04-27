import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useSWRxActivityList } from '~/stores/activity';

import { AuditLogManagement } from './AuditLog/AuditLogManagement';

const AuditLog: FC = () => {
  const { t } = useTranslation();

  const { data: activityListData } = useSWRxActivityList(10, 0);
  const activityList = activityListData?.docs != null ? activityListData.docs : [];

  return (
    <div data-testid="admin-auditlog">
      <h2>{t('AuditLog')}</h2>
      <AuditLogManagement activityList={activityList} />
    </div>
  );
};

export default AuditLog;
