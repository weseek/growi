import React, { memo } from 'react';

import dynamic from 'next/dynamic';

import { useSWRxCurrentPage } from '~/stores/page';

import { Skelton } from './Skelton';

export const PageContentFooter = memo((): JSX.Element => {

  const AuthorInfo = dynamic(() => import('./Navbar/AuthorInfo'), { ssr: false, loading: () => <p><Skelton width={300} height={20} /></p> });

  const { data: page } = useSWRxCurrentPage();

  if (page == null) {
    return <></>;
  }

  return (
    <div className="page-content-footer py-4 d-edit-none d-print-none">
      <div className="grw-container-convertible">
        <div className="page-meta">
          <AuthorInfo user={page.creator} date={page.createdAt} mode="create" locate="footer" />
          <AuthorInfo user={page.revision.author} date={page.updatedAt} mode="update" locate="footer" />
        </div>
      </div>
    </div>
  );
});

PageContentFooter.displayName = 'PageContentFooter';
