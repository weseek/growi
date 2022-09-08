import React, { memo } from 'react';

import { IUser, Ref } from '@growi/core';
import dynamic from 'next/dynamic';

import { IUserHasId } from '~/interfaces/user';

import { Skelton } from './Skelton';

import styles from './PageContentFooter.module.scss';

const AuthorInfo = dynamic(() => import('./Navbar/AuthorInfo'),
  { ssr: false, loading: () => <Skelton additionalClass={`${styles['page-content-footer-skelton']} mb-3`} /> });

export type PageContentFooterProps = {
  createdAt: Date,
  updatedAt: Date,
  creator: IUserHasId,
  revisionAuthor: Ref<IUser>,
}

export const PageContentFooter = memo((props: PageContentFooterProps): JSX.Element => {
  const {
    createdAt, updatedAt, creator, revisionAuthor,
  } = props;

  return (
    <div className={`${styles['page-content-footer']} page-content-footer py-4 d-edit-none d-print-none}`}>
      <div className="grw-container-convertible">
        <div className="page-meta">
          <AuthorInfo user={creator} date={createdAt} mode="create" locate="footer" />
          <AuthorInfo user={revisionAuthor} date={updatedAt} mode="update" locate="footer" />
        </div>
      </div>
    </div>
  );
});

PageContentFooter.displayName = 'PageContentFooter';
