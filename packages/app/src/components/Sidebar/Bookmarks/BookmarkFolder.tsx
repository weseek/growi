
import React from 'react';

import { useTranslation } from 'next-i18next';

import ClosableTextInput from '~/components/Common/ClosableTextInput';

import BookmarkFolderTree from './BookmarkFolderTree';

type Props = {
  onClickNewFolder: () => void
  isRenameInputShown: boolean
  folderName: string
  onClickOutside: () => void
  onPressEnter: (folderName: string) => void
}
const BookmarkFolder = (props: Props): JSX.Element => {
  const {
    onClickNewFolder, isRenameInputShown, folderName, onClickOutside, onPressEnter,
  } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className="col-8 mb-2 ">
        <button
          className="btn btn-block btn-outline-secondary rounded-pill d-flex justify-content-start align-middle"
          onClick={onClickNewFolder}
        >
          <i className="fa fa fa-folder-o" style={{ fontSize: '1.4em' }}></i>
          <span className="mx-2 ">New Folder</span>
        </button>
      </div>
      {
        isRenameInputShown && (
          <div className="col-10 mb-2 ml-2 ">
            <ClosableTextInput
              value={folderName}
              placeholder={t('Input Folder name')}
              onClickOutside={onClickOutside}
              onPressEnter={onPressEnter}
            />
          </div>
        )
      }
      <BookmarkFolderTree />
    </>
  );
};

export default BookmarkFolder;
