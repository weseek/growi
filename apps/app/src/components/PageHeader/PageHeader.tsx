import type { FC } from 'react';

import type { IUserHasId } from '@growi/core';
import { DevidedPagePath } from '@growi/core/dist/models';

import { useSWRxCurrentPage } from '~/stores/page';

import { PagePathHeader } from './PagePathHeader';
import { PageTitleHeader } from './PageTitleHeader';
import { UserList } from './UserList';

import styles from './PageHeader.module.scss';

const moduleClass = styles['page-header'] ?? '';

type Props = {
  userList: IUserHasId[]
}

export const PageHeader: FC<Props> = (props) => {
  const { userList } = props;
  const { data: currentPage } = useSWRxCurrentPage();

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
        <UserList
          className={`z-2 ${dPagePath.isRoot ? '' : 'col mt-2'}`}
          userList={userList}
        />
      </div>
    </div>
  );
};
