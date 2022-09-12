import React, { memo } from 'react';

import { IPage } from '@growi/core';
import dynamic from 'next/dynamic';

import { IUser } from '~/interfaces/user';

import { Skelton } from './Skelton';

import styles from './PageContentFooter.module.scss';

const AuthorInfo = dynamic(() => import('./Navbar/AuthorInfo'),
  { ssr: false, loading: () => <Skelton additionalClass={`${styles['page-content-footer-skelton']} mb-3`} /> });

export type PageContentFooterProps = {
  page: IPage,
}

export const PageContentFooter = memo((props: PageContentFooterProps): JSX.Element => {
  const { page } = props;

  const {
    creator, lastUpdateUser, createdAt, updatedAt,
  } = page;

  return (
    <div className={`${styles['page-content-footer']} page-content-footer py-4 d-edit-none d-print-none}`}>
      <div className="grw-container-convertible">
        <div className="page-meta">
          <AuthorInfo user={creator as IUser} date={createdAt} mode="create" locate="footer" />
          <AuthorInfo user={lastUpdateUser as IUser} date={updatedAt} mode="update" locate="footer" />
        </div>
      </div>
    </div>
  );
});

PageContentFooter.displayName = 'PageContentFooter';
