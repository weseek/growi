import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';

import { RecentlyCreatedIcon } from '~/components/Icons/RecentlyCreatedIcon';
import { RecentCreated } from '~/components/RecentCreated/RecentCreated';
import styles from '~/components/UsersHomePageFooter.module.scss';

import { BookmarkFolderTree } from './Bookmarks/BookmarkFolderTree';
import { CompressIcon } from './Icons/CompressIcon';
import { ExpandIcon } from './Icons/ExpandIcon';

export type UsersHomePageFooterProps = {
  creatorId: string,
}

export const UsersHomePageFooter = (props: UsersHomePageFooterProps): JSX.Element => {
  const { t } = useTranslation();
  const { creatorId } = props;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className={`container-lg user-page-footer py-5 ${styles['user-page-footer']}`}>
      <div className="grw-user-page-list-m d-edit-none">
        <h2 id="bookmarks-list" className="grw-user-page-header border-bottom pb-2 mb-3 d-flex">
          <i style={{ fontSize: '1.3em' }} className="fa fa-fw fa-bookmark-o"></i>
          {t('footer.bookmarks')}
          <span className="ml-auto pl-2 ">
            <button
              className={`btn btn-sm grw-expand-compress-btn ${isExpanded ? 'active' : ''}`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              { isExpanded
                ? <ExpandIcon/>
                : <CompressIcon />
              }
            </button>
          </span>
        </h2>
        {/* TODO: In bookmark folders v1, the button to create a new folder does not exist. The button should be included in the bookmark component. */}
        <div className={`${isExpanded ? `${styles['grw-bookarks-contents-expanded']}` : `${styles['grw-bookarks-contents-compressed']}`}`}>
          <BookmarkFolderTree isUserHomePage={true} userId={creatorId} />
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
