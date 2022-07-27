import React, { FC, memo } from 'react';

import { Nullable, Ref } from '@growi/core';
import dynamic from 'next/dynamic';

import { MySkelton } from '~/components/MySkelton';

import { IUser } from '../interfaces/user';


const AuthorInfo = dynamic(() => import('./Navbar/AuthorInfo'), { ssr: false });

type Props = {
  createdAt: Nullable<Date> | undefined, // TODO: check createdAt type
  updatedAt: Nullable<Date> | undefined, // TODO: check updatedAt type
  creator: any,
  revisionAuthor: Ref<IUser>,
}

export const PageContentFooter:FC<Props> = memo((props:Props):JSX.Element => {
  const {
    createdAt, updatedAt, creator, revisionAuthor,
  } = props;

  return (
    <div className="page-content-footer py-4 d-edit-none d-print-none">
      <div className="grw-container-convertible">
        <div className="page-meta">
          {createdAt === null || updatedAt === null ? (
            <>
              <MySkelton />
              <MySkelton />
            </>
          ) : (
            <>
              <AuthorInfo user={creator as IUser} date={createdAt} mode="create" locate="footer" />
              <AuthorInfo user={revisionAuthor as IUser} date={updatedAt} mode="update" locate="footer" />
            </>
          )}
        </div>
      </div>
    </div>
  );
});

PageContentFooter.displayName = 'PageContentFooter';
