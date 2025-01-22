import type { IPage, IPagePopulatedToShowRevision } from '@growi/core';
import dynamic from 'next/dynamic';

import styles from './PageContentFooter.module.scss';

const AuthorInfo = dynamic(() => import('~/client/components/AuthorInfo').then(mod => mod.AuthorInfo), { ssr: false });

export type PageContentFooterProps = {
  page: IPage | IPagePopulatedToShowRevision,
}

export const PageContentFooter = (props: PageContentFooterProps): React.ReactElement => {

  const { page } = props;

  const {
    creator, lastUpdateUser, createdAt, updatedAt,
  } = page;

  if (page.isEmpty) {
    return <></>;
  }

  return (
    <div className={`${styles['page-content-footer']} page-content-footer py-4 d-edit-none d-print-none}`}>
      <div className="container-lg grw-container-convertible">
        <div className="page-meta">
          <AuthorInfo user={creator} date={createdAt} mode="create" locate="footer" />
          <AuthorInfo user={lastUpdateUser} date={updatedAt} mode="update" locate="footer" />
        </div>
      </div>
    </div>
  );
};
