import React, { FC, memo } from 'react';

import { Ref } from '@growi/core';

import { IUser } from '../interfaces/user';

import AuthorInfo from './Navbar/AuthorInfo';

type Props = {
  createdAt: Date,
  updatedAt: Date,
  creator: any,
  revisionAuthor: Ref<IUser>,
}

const PageContentFooter:FC<Props> = memo((props:Props):JSX.Element => {
  const {
    createdAt, updatedAt, creator, revisionAuthor,
  } = props;

  return (
    <div className="page-content-footer py-4 d-edit-none d-print-none">
      <div className="grw-container-convertible">
        <div className="page-meta">
          <AuthorInfo user={creator as IUser} date={createdAt} mode="create" locate="footer" />
          <AuthorInfo user={revisionAuthor as IUser} date={updatedAt} mode="update" locate="footer" />
        </div>
      </div>
    </div>
  );
});

PageContentFooter.displayName = 'PageContentFooter';

export default PageContentFooter;
