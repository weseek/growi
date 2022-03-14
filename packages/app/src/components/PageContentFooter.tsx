import React, { FC, memo } from 'react';

import AuthorInfo from './Navbar/AuthorInfo';

import { Ref } from '../interfaces/common';
import { IUser } from '../interfaces/user';

type Props = {
  createdAt: Date,
  updatedAt: Date,
  creator: Ref<IUser>,
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


export default PageContentFooter;
