import React, { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { apiv3Post } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { BookmarkFolderNameInput } from '~/components/Bookmarks/BookmarkFolderNameInput';
import { BookmarkFolderTree } from '~/components/Bookmarks/BookmarkFolderTree';
import { FolderPlusIcon } from '~/components/Icons/FolderPlusIcon';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';


export const BookmarkContents = (): JSX.Element => {

  const { t } = useTranslation();
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);
  const { mutate: mutateChildBookmarkData } = useSWRxBookamrkFolderAndChild();


  const onClickNewBookmarkFolder = useCallback(() => {
    setIsCreateAction(true);
  }, []);

  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {

    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: null });
      await mutateChildBookmarkData();
      setIsCreateAction(false);
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateChildBookmarkData]);

  const renderAddNewBookmarkFolder = useCallback(() => (
    <>
      <div className="col-8 mb-2 ">
        <button
          className="btn btn-block btn-outline-secondary rounded-pill d-flex justify-content-start align-middle"
          onClick={onClickNewBookmarkFolder}
        >
          <FolderPlusIcon />
          <span className="mx-2 ">{t('bookmark_folder.new_folder')}</span>
        </button>
      </div>
      {
        isCreateAction && (
          <div className="col-12 mb-2 ">
            <BookmarkFolderNameInput
              onClickOutside={() => setIsCreateAction(false)}
              onPressEnter={onPressEnterHandlerForCreate}
            />
          </div>
        )
      }
    </>
  ), [isCreateAction, onClickNewBookmarkFolder, onPressEnterHandlerForCreate, t]);

  return (
    <>
      {
        renderAddNewBookmarkFolder()
      }
      <BookmarkFolderTree />
    </>
  );
};
