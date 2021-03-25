import { VFC } from 'react';

import { useIsEnabledStaleNotification } from '~/stores/context';

import { StaleAlert } from '~/components/PageAlert/StaleAlert';
import { RenameAlert } from '~/components/PageAlert/RenameAlert';
import { DuplicatedAlert } from '~/components/PageAlert/DuplicatedAlert';

export const PageAlerts:VFC = () => {
  const { data: isEnabledStaleNotification } = useIsEnabledStaleNotification();

  return (
    <div className="row row-alerts d-edit-none">
      <div className="col-sm-12">
        {isEnabledStaleNotification && <StaleAlert />}
        <RenameAlert />
        <DuplicatedAlert />
      </div>
    </div>
  );
};
