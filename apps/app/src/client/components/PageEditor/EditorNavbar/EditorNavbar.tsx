import { useMemo } from 'react';

import { PageHeader } from '~/client/components/PageHeader';
import { useIsYjsEnabled } from '~/client/services/yjs';
import { useEditingUsers } from '~/stores/use-editing-users';

import { EditingUserList } from './EditingUserList';

import styles from './EditorNavbar.module.scss';

const moduleClass = styles['editor-navbar'] ?? '';

export const EditorNavbar = (): JSX.Element => {
  const { data: editingUsers } = useEditingUsers();
  const isYjsEnabled = useIsYjsEnabled();

  const editorCondition = useMemo(() => {
    if (isYjsEnabled) {
      return (
        <div data-testid="editing-user-list">
          <EditingUserList userList={editingUsers?.userList ?? []} />
        </div>
      );
    }

    if (isYjsEnabled === false) {
      return (
        <div data-testid="single-editor-badge" className="text-warning bg-warning-subtle rounded-1 px-1">
          <div className="d-flex align-items-center justify-content-center">
            <span className="material-symbols-outlined fs-6 me-1">error</span>SINGLE
          </div>
        </div>
      );
    }

    return <></>;
  }, [editingUsers?.userList, isYjsEnabled]);

  return (
    <div className={`${moduleClass} d-flex flex-column flex-sm-row justify-content-between ps-3 ps-md-5 ps-xl-4 pe-4 py-1 align-items-sm-end`}>
      <div className="order-2 order-sm-1">
        <PageHeader />
      </div>
      <div className="order-1 order-sm-2">
        {editorCondition}
      </div>
    </div>
  );
};
