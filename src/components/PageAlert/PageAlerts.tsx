import { VFC } from 'react';
import { RenameAlert } from '~/components/PageAlert/RenameAlert';
import { DuplicatedAlert } from '~/components/PageAlert/DuplicatedAlert';

export const PageAlerts:VFC = () => {
  return (
    <div className="row row-alerts d-edit-none">
      <div className="col-sm-12">
        <RenameAlert />
        <DuplicatedAlert />
      </div>
    </div>
  );
};
