import type { FC } from 'react';

import { DevidedPagePath } from '@growi/core/dist/models';

import { useSWRxCurrentPage } from '~/stores/page';
import { useEditingUsers } from '~/stores/use-editing-users';

import { EditingUserList } from './EditingUserList';
import { PagePathHeader } from './PagePathHeader';
import { PageTitleHeader } from './PageTitleHeader';

import styles from './PageHeader.module.scss';

const moduleClass = styles['page-header'] ?? '';

export const PageHeader: FC = () => {
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: editingUsers } = useEditingUsers();

  if (currentPage == null) {
    return <></>;
  }

  const dPagePath = new DevidedPagePath(currentPage.path, true);

  return (
    <div className={moduleClass}>
      <PagePathHeader
        currentPage={currentPage}
      />
      <div className="row mt-2">
        <PageTitleHeader
          className="col"
          currentPage={currentPage}
        />
        <EditingUserList
          className={`${dPagePath.isRoot ? 'mt-1' : 'col mt-2'}`}
          userList={editingUsers?.userList ?? []}
        />
      </div>
    </div>
  );
};
