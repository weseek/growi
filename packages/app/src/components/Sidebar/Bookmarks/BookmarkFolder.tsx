
import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';

import FolderPlusIcon from '~/components/Icons/FolderPlusIcon';

import BookmarkFolderNameInput from './BookmarkFolderNameInput';
import BookmarkFolderTree from './BookmarkFolderTree';


const BookmarkFolder = (): JSX.Element => {

  const { t } = useTranslation();
  const [isRenameInputShown, setIsRenameInputShown] = useState<boolean>(false);

  const onClickBookmarkFolder = () => {
    setIsRenameInputShown(true);
  };

  return (
    <>
      <div className="col-8 mb-2 ">
        <button
          className="btn btn-block btn-outline-secondary rounded-pill d-flex justify-content-start align-middle"
          onClick={onClickBookmarkFolder}
        >
          <FolderPlusIcon />
          <span className="mx-2 ">New Folder</span>
        </button>
      </div>
      {
        isRenameInputShown && (
          <div className="col-12 mb-2 ">
            <BookmarkFolderNameInput
              onClickOutside={() => setIsRenameInputShown(false)}
            />
          </div>
        )
      }
      <BookmarkFolderTree />
    </>
  );
};

export default BookmarkFolder;
