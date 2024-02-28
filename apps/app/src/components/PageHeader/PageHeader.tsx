import type { FC } from 'react';

import { DevidedPagePath } from '@growi/core/dist/models';
import { useEditingUsers } from '@growi/core/dist/swr';

import { useSWRxCurrentPage } from '~/stores/page';

import { EditingUserList } from './EditingUserList';
import { PagePathHeader } from './PagePathHeader';
import { PageTitleHeader } from './PageTitleHeader';

import styles from './PageHeader.module.scss';

const moduleClass = styles['page-header'] ?? '';

export const PageHeader: FC = () => {
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: EditingUsers } = useEditingUsers();

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
          className={`z-2 ${dPagePath.isRoot ? '' : 'col mt-2'}`}
          userList={EditingUsers?.userList ?? []}
        />
      </div>
    </div>
  );
};
