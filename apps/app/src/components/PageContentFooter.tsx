import React from 'react';

import type { IPage, IUser } from '@growi/core';
import dynamic from 'next/dynamic';

import type { AuthorInfoProps } from './AuthorInfo';

import styles from './PageContentFooter.module.scss';

const AuthorInfo = dynamic<AuthorInfoProps>(() => import('./AuthorInfo').then(mod => mod.AuthorInfo), { ssr: false });

export type PageContentFooterProps = {
  page: IPage,
}

export const PageContentFooter = (props: PageContentFooterProps): JSX.Element => {

  const { page } = props;

  const {
    creator, lastUpdateUser, createdAt, updatedAt,
  } = page;

  return (
    <div className={`${styles['page-content-footer']} page-content-footer py-4 d-edit-none d-print-none}`}>
      <div className="container-lg grw-container-convertible">
        <div className="page-meta">
          <AuthorInfo user={creator as IUser} date={createdAt} mode="create" locate="footer" />
          <AuthorInfo user={lastUpdateUser as IUser} date={updatedAt} mode="update" locate="footer" />
        </div>
      </div>
    </div>
  );
};
