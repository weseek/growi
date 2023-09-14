import React, { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { apiv3Post } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/toastr';
import { BookmarkFolderNameInput } from '~/components/Bookmarks/BookmarkFolderNameInput';
import { BookmarkFolderTree } from '~/components/Bookmarks/BookmarkFolderTree';
import { FolderPlusIcon } from '~/components/Icons/FolderPlusIcon';
import { useSWRxBookmarkFolderAndChild } from '~/stores/bookmark-folder';
import { useCurrentUser } from '~/stores/context';

export const BookmarkContents = (): JSX.Element => {

  const { t } = useTranslation();
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);

  const { data: currentUser } = useCurrentUser();
  const { mutate: mutateBookmarkFolders } = useSWRxBookmarkFolderAndChild(currentUser?._id);

  const onClickNewBookmarkFolder = useCallback(() => {
    setIsCreateAction(true);
  }, []);

  const onClickonClickOutsideHandler = useCallback(() => {
    setIsCreateAction(false);
  }, []);

  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: null });
      await mutateBookmarkFolders();
      setIsCreateAction(false);
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateBookmarkFolders]);

  return (
    <>
      <div className="col-8 mb-2 ">
        <button
          type="button"
          className="btn btn-block btn-outline-secondary rounded-pill d-flex justify-content-start align-middle"
          onClick={onClickNewBookmarkFolder}
        >
          <FolderPlusIcon />
          <span className="mx-2 ">{t('bookmark_folder.new_folder')}</span>
        </button>
      </div>
      {isCreateAction && (
        <div className="col-12 mb-2 ">
          <BookmarkFolderNameInput
            onClickOutside={onClickonClickOutsideHandler}
            onPressEnter={onPressEnterHandlerForCreate}
          />
        </div>
      )}
      <BookmarkFolderTree isOperable userId={currentUser?._id} />
    </>
  );
};
