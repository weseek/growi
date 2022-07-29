import React, { memo } from 'react';

import dynamic from 'next/dynamic';

import {
  useCurrentCreatedAt, useCurrentUpdatedAt, useCreator, useRevisionAuthor,
} from '../stores/context';

import { Skelton } from './Skelton';

export const PageContentFooter = memo((): JSX.Element => {

  const AuthorInfo = dynamic(() => import('./Navbar/AuthorInfo'), { ssr: false, loading: () => <p><Skelton width={300} height={20} /></p> });

  const { data: createdAt } = useCurrentCreatedAt();
  const { data: updatedAt } = useCurrentUpdatedAt();
  const { data: creator } = useCreator();
  const { data: revisionAuthor } = useRevisionAuthor();

  return (
    <div className="page-content-footer py-4 d-edit-none d-print-none">
      <div className="grw-container-convertible">
        <div className="page-meta">
          <>
            <AuthorInfo user={creator} date={createdAt} mode="create" locate="footer" />
            <AuthorInfo user={revisionAuthor} date={updatedAt} mode="update" locate="footer" />
          </>
        </div>
      </div>
    </div>
  );
});

PageContentFooter.displayName = 'PageContentFooter';
