import React, { memo } from 'react';

import dynamic from 'next/dynamic';

import { useSWRxCurrentPage } from '~/stores/page';

import { Skelton } from './Skelton';

import styles from './PageContentFooter.module.scss';

export const PageContentFooter = memo((): JSX.Element => {

  const AuthorInfo = dynamic(() => import('./Navbar/AuthorInfo'),
    { ssr: false, loading: () => <Skelton additionalClass={`${styles['page-content-footer-skelton']} mb-3`} /> });

  const { data: page } = useSWRxCurrentPage();

  if (page == null) {
    return <></>;
  }

  return (
    // TODO: page-content-footer, scss module import and global import.
    <div className={`${styles['page-content-footer']} page-content-footer py-4 d-edit-none d-print-none}`}>
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
