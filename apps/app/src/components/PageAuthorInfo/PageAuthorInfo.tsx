import { memo } from 'react';

import type { IUser } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';

import { useCurrentPathname } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';
import { useIsAbleToShowPageAuthors } from '~/stores/ui';

import { AuthorInfo } from '../AuthorInfo';


import styles from './PageAuthorInfo.module.scss';


export const PageAuthorInfo = memo((): JSX.Element => {
  const { data: currentPage } = useSWRxCurrentPage();

  const { data: currentPathname } = useCurrentPathname();
  const { data: isAbleToShowPageAuthors } = useIsAbleToShowPageAuthors();

  if (!isAbleToShowPageAuthors) {
    return <></>;
  }

  const path = currentPage?.path ?? currentPathname;

  if (pagePathUtils.isUsersHomepage(path ?? '')) {
    return <></>;
  }

  return (
    <ul className={`grw-page-author-info ${styles['grw-page-author-info']} text-nowrap border-start d-none d-lg-block d-edit-none py-2 ps-4 mb-0 ms-3`}>
      <li className="pb-1">
        {currentPage != null && (
          <AuthorInfo user={currentPage.creator as IUser} date={currentPage.createdAt} mode="create" locate="subnav" />
        )}
      </li>
      <li className="mt-1 pt-1 border-top">
        {currentPage != null && (
          <AuthorInfo user={currentPage.lastUpdateUser as IUser} date={currentPage.updatedAt} mode="update" locate="subnav" />
        )}
      </li>
    </ul>
  );
});
