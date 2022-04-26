import React, { FC } from 'react';

import { useSWRxActivityList } from '~/stores/activity';

const AuditLog: FC = () => {
  const { data: activityListData } = useSWRxActivityList(5, 0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activityList = activityListData != null ? activityListData : null;

  return (
    <>Hello, AuditLog</>
  );
};

export default AuditLog;
