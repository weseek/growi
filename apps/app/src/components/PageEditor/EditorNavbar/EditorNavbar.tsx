
import { PageHeader } from '~/components/PageHeader';
import { useEditingUsers } from '~/stores/use-editing-users';

import { EditingUserList } from './EditingUserList';

export const EditorNavbar = (): JSX.Element => {
  const { data: editingUsers } = useEditingUsers();

  return (
    <div className="px-4 py-2">
      <div className="d-flex justify-content-between">
        <PageHeader />
        <EditingUserList
          userList={editingUsers?.userList ?? []}
        />
      </div>
    </div>
  );
};
