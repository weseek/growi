import React, { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';
import FolderPlusIcon from '~/components/Icons/FolderPlusIcon';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';

import BookmarkFolderNameInput from './BookmarkFolderNameInput';
import BookmarkFolderTree from './BookmarkFolderTree';


const BookmarkFolder = (): JSX.Element => {

  const { t } = useTranslation();
  const [isRenameInputShown, setIsRenameInputShown] = useState<boolean>(false);
  const { mutate: mutateChildBookmarkData } = useSWRxBookamrkFolderAndChild(null);


  const onClickBookmarkFolder = () => {
    setIsRenameInputShown(true);
  };

  const onPressEnterHandler = useCallback(async(folderName: string) => {

    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: null });
      await mutateChildBookmarkData();
      setIsRenameInputShown(false);
      toastSuccess(t('toaster.create_succeeded', { target: t('bookmark_folder.bookmark_folder') }));
    }
    catch (err) {
      toastError(err);
    }

  }, [mutateChildBookmarkData, t]);

  return (
    <>
      <div className="col-8 mb-2 ">
        <button
          className="btn btn-block btn-outline-secondary rounded-pill d-flex justify-content-start align-middle"
          onClick={onClickBookmarkFolder}
        >
          <FolderPlusIcon />
          <span className="mx-2 ">{t('bookmark_folder.new_folder')}</span>
        </button>
      </div>
      {
        isRenameInputShown && (
          <div className="col-12 mb-2 ">
            <BookmarkFolderNameInput
              onClickOutside={() => setIsRenameInputShown(false)}
              onPressEnter={onPressEnterHandler}
            />
          </div>
        )
      }
      <BookmarkFolderTree />
    </>
  );
};

export default BookmarkFolder;
