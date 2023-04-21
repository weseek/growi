import React, { useCallback, useMemo, useState } from 'react';

import { useTranslation } from 'next-i18next';


import { apiv3Post } from '~/client/util/apiv3-client';
import { addNewFolder } from '~/client/util/bookmark-utils';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { RecentlyCreatedIcon } from '~/components/Icons/RecentlyCreatedIcon';
import { RecentCreated } from '~/components/RecentCreated/RecentCreated';
import styles from '~/components/UsersHomePageFooter.module.scss';
import { useSWRxBookmarkFolderAndChild } from '~/stores/bookmark-folder';

import { BookmarkFolderNameInput } from './Bookmarks/BookmarkFolderNameInput';
import { BookmarkFolderTree } from './Bookmarks/BookmarkFolderTree';
import { CompressIcon } from './Icons/CompressIcon';
import { ExpandIcon } from './Icons/ExpandIcon';
import { FolderPlusIcon } from './Icons/FolderPlusIcon';


export type UsersHomePageFooterProps = {
  creatorId: string,
}

export const UsersHomePageFooter = (props: UsersHomePageFooterProps): JSX.Element => {
  const { t } = useTranslation();
  const { creatorId } = props;
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { mutate: mutateChildBookmarkData } = useSWRxBookmarkFolderAndChild();

  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await addNewFolder(folderName, null);
      await mutateChildBookmarkData();
      setIsCreateAction(false);
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateChildBookmarkData, t]);

  return (
    <div className={`container-lg user-page-footer py-5 ${styles['user-page-footer']}`}>
      <div className="grw-user-page-list-m d-edit-none">
        <h2 id="bookmarks-list" className="grw-user-page-header border-bottom pb-2 mb-3 d-flex">
          <i style={{ fontSize: '1.3em' }} className="fa fa-fw fa-bookmark-o"></i>
          {t('footer.bookmarks')}
          <span className="pl-2">
            <button
              className="btn btn-outline-secondary btn-sm new-bookmark-folder"
              onClick={() => setIsCreateAction(true)}
            >
              <FolderPlusIcon />
              <span className="mx-2 ">{t('bookmark_folder.new_folder')}</span>
            </button>
          </span>
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
        { isCreateAction && (
          <div className="row">
            <div className="col-sm-12 col-md-12 col-lg-4 mb-2">
              <BookmarkFolderNameInput
                onClickOutside={() => setIsCreateAction(false)}
                onPressEnter={onPressEnterHandlerForCreate}
              />
            </div>

          </div>
        )}
        <div className={`${isExpanded ? `${styles['grw-bookarks-contents-expanded']}` : `${styles['grw-bookarks-contents-compressed']}`}`}>
          <BookmarkFolderTree isUserHomePage={true} />
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
