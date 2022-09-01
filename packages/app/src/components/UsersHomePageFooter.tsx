import React from 'react';

import { useTranslation } from 'next-i18next';

import { RecentlyCreatedIcon } from '~/components/Icons/RecentlyCreatedIcon';
import { BookmarkList } from '~/components/PageList/BookmarkList';
import { RecentCreated } from '~/components/RecentCreated/RecentCreated';
import styles from '~/components/UsersHomePageFooter.module.scss';

export type UsersHomePageFooterProps = {
  creatorId: string,
}

export const UsersHomePageFooter = (props: UsersHomePageFooterProps): JSX.Element => {
  const { t } = useTranslation();
  const { creatorId } = props;

  return (
    <div className={`container-lg user-page-footer py-5 ${styles['user-page-footer']}`}>
      <div className="grw-user-page-list-m d-edit-none">
        <h2 id="bookmarks-list" className="grw-user-page-header border-bottom pb-2 mb-3">
          <i style={{ fontSize: '1.3em' }} className="fa fa-fw fa-bookmark-o"></i>
          {t('footer.bookmarks')}
        </h2>
        <div id="user-bookmark-list" className={`page-list ${styles['page-list']}`}>
          <BookmarkList userId={creatorId} />
        </div>
      </div>
      <div className="grw-user-page-list-m mt-5 d-edit-none">
        <h2 id="recently-created-list" className="grw-user-page-header border-bottom pb-2 mb-3">
          <i id="recent-created-icon" className="mr-1"><RecentlyCreatedIcon /></i>
          {t('footer.recently_created')}
        </h2>
        <div id="user-created-list" className={`page-list ${styles['page-list']}`}>
          <RecentCreated userId={creatorId} />
        </div>
      </div>
    </div>
  );
};
