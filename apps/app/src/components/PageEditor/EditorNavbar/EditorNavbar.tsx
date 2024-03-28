
import { PageHeader } from '~/components/PageHeader';
import { useEditingUsers } from '~/stores/use-editing-users';

import { EditingUserList } from './EditingUserList';

import styles from './EditorNavbar.module.scss';

const moduleClass = styles['editor-navbar'] ?? '';

export const EditorNavbar = (): JSX.Element => {
  const { data: editingUsers } = useEditingUsers();

  return (
    <div className={`${moduleClass} d-flex justify-content-between px-4 py-1 ms-3`}>
      <PageHeader />
      <EditingUserList
        userList={editingUsers?.userList ?? []}
      />
    </div>
  );
};
