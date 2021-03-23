import { VFC } from 'react';
import { RenameAlert } from '~/components/PageAlert/RenameAlert';

export const PageAlerts:VFC = () => {
  return (
    <div className="row row-alerts d-edit-none">
      <div className="col-sm-12">
        <RenameAlert />
      </div>
    </div>
  );
};
