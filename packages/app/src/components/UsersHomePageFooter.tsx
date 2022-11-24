import React, { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';
import { RecentlyCreatedIcon } from '~/components/Icons/RecentlyCreatedIcon';
import { BookmarkList } from '~/components/PageList/BookmarkList';
import { RecentCreated } from '~/components/RecentCreated/RecentCreated';
import styles from '~/components/UsersHomePageFooter.module.scss';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';

import FolderPlusIcon from './Icons/FolderPlusIcon';
import BookmarkFolderNameInput from './Sidebar/Bookmarks/BookmarkFolderNameInput';

export type UsersHomePageFooterProps = {
  creatorId: string,
}

export const UsersHomePageFooter = (props: UsersHomePageFooterProps): JSX.Element => {
  const { t } = useTranslation();
  const { creatorId } = props;
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);
  const { mutate: mutateChildBookmarkData } = useSWRxBookamrkFolderAndChild(null);


  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: null });
      await mutateChildBookmarkData();
      setIsCreateAction(false);
      toastSuccess(t('toaster.create_succeeded', { target: t('bookmark_folder.bookmark_folder') }));
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateChildBookmarkData, t]);

  return (
    <div className={`container-lg user-page-footer py-5 ${styles['user-page-footer']}`}>
      <div className="grw-user-page-list-m d-edit-none">
        <h2 id="bookmarks-list" className="grw-user-page-header border-bottom pb-2 mb-3">
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
