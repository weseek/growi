import {
  FC, useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import { DropdownToggle } from 'reactstrap';

import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiv3Delete, apiv3Post, apiv3Put } from '~/client/util/apiv3-client';
import CountBadge from '~/components/Common/CountBadge';
import FolderIcon from '~/components/Icons/FolderIcon';
import TriangleIcon from '~/components/Icons/TriangleIcon';
import { BookmarkFolderItems } from '~/interfaces/bookmark-info';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';

import BookmarkFolderItemControl from './BookmarkFolderItemControl';
import BookmarkFolderNameInput from './BookmarkFolderNameInput';
import DeleteBookmarkFolderModal from './DeleteBookmarkFolderModal';


type BookmarkFolderItemProps = {
  bookmarkFolder: BookmarkFolderItems
  isOpen?: boolean
}
const BookmarkFolderItem: FC<BookmarkFolderItemProps> = (props: BookmarkFolderItemProps) => {
  const { bookmarkFolder, isOpen: _isOpen = false } = props;

  const { t } = useTranslation();
  const {
    name, _id: folderId, children, parent,
  } = bookmarkFolder;
  const [currentChildren, setCurrentChildren] = useState<BookmarkFolderItems[]>();
  const [targetFolder, setTargetFolder] = useState<string | null>(folderId);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const { data: childBookmarkFolderData, mutate: mutateChildBookmarkData } = useSWRxBookamrkFolderAndChild(targetFolder);
  const { mutate: mutateParentBookmarkFolder } = useSWRxBookamrkFolderAndChild(parent);
  const [isRenameAction, setIsRenameAction] = useState<boolean>(false);
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);
  const [isDeleteFolderModalShown, setIsDeleteFolderModalShown] = useState<boolean>(false);

  const childCount = useCallback((): number => {
    if (currentChildren != null && currentChildren.length > children.length) {
      return currentChildren.length;
    }
    return children.length;
  }, [children.length, currentChildren]);

  useEffect(() => {
    if (childBookmarkFolderData != null) {
      mutateChildBookmarkData();
      setCurrentChildren(childBookmarkFolderData);
    }
  }, [childBookmarkFolderData, mutateChildBookmarkData]);

  const hasChildren = useCallback((): boolean => {
    if (currentChildren != null && currentChildren.length > children.length) {
      return currentChildren.length > 0;
    }
    return children.length > 0;
  }, [children.length, currentChildren]);

  const loadChildFolder = useCallback(async() => {
    setIsOpen(!isOpen);
    setTargetFolder(folderId);
  }, [folderId, isOpen]);

  const loadParent = useCallback(async() => {
    mutateParentBookmarkFolder();
  }, [mutateParentBookmarkFolder]);

  // Rename  for bookmark folder handler
  const onPressEnterHandlerForRename = useCallback(async(folderName: string) => {
    try {
      await apiv3Put('/bookmark-folder', { bookmarkFolderId: folderId, name: folderName, parent });
      loadParent();
      setIsRenameAction(false);
      toastSuccess(t('toaster.update_successed', { target: t('bookmark_folder.bookmark_folder') }));
    }
    catch (err) {
      toastError(err);
    }
  }, [folderId, loadParent, parent, t]);

  // Create new folder / subfolder handler
  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: targetFolder });
      setIsOpen(true);
      setIsCreateAction(false);
      mutateChildBookmarkData();
      toastSuccess(t('toaster.create_succeeded', { target: t('bookmark_folder.bookmark_folder') }));

    }
    catch (err) {
      toastError(err);
    }

  }, [mutateChildBookmarkData, t, targetFolder]);

  const onClickPlusButton = useCallback(async() => {
    if (!isOpen && hasChildren()) {
      setIsOpen(true);
    }
    setIsCreateAction(true);
  }, [hasChildren, isOpen]);

  const RenderChildFolder = () => {
    return isOpen && currentChildren?.map((childFolder) => {
      return (
        <div key={childFolder._id} className="grw-foldertree-item-children">
          <BookmarkFolderItem
            key={childFolder._id}
            bookmarkFolder={childFolder}
          />
        </div>
      );
    });
  };

  const onClickRenameHandler = useCallback(() => {
    setIsRenameAction(true);
  }, []);

  const onClickDeleteHandler = useCallback(() => {
    setIsDeleteFolderModalShown(true);
  }, []);

  const onDeleteFolderModalClose = useCallback(() => {
    setIsDeleteFolderModalShown(false);
  }, []);

  const onClickDeleteButtonHandler = useCallback(async() => {
    try {
      await apiv3Delete(`/bookmark-folder/${folderId}`);
      setIsDeleteFolderModalShown(false);
      loadParent();
      toastSuccess(t('toaster.delete_succeeded', { target: t('bookmark_folder.bookmark_folder') }));
    }
    catch (err) {
      toastError(err);
    }
  }, [folderId, loadParent, t]);

  return (
    <div id={`bookmark-folder-item-${folderId}`} className="grw-foldertree-item-container"
    >
      <li className="list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center">
        <div className="grw-triangle-container d-flex justify-content-center">
          {hasChildren() && (
            <button
              type="button"
              className={`grw-foldertree-triangle-btn btn ${isOpen ? 'grw-foldertree-open' : ''}`}
              onClick={loadChildFolder}
            >
              <div className="d-flex justify-content-center">
                <TriangleIcon />
              </div>
            </button>
          )}
        </div>
        {
          <div>
            <FolderIcon isOpen={isOpen} />
          </div>
        }
        { isRenameAction ? (
          <BookmarkFolderNameInput
            onClickOutside={() => setIsRenameAction(false)}
            onPressEnter={onPressEnterHandlerForRename}
            value={name}
          />
        ) : (
          <>
            <div className='grw-foldertree-title-anchor flex-grow-1 pl-2' onClick={loadChildFolder}>
              <p className={'text-truncate m-auto '}>{name}</p>
            </div>
            {hasChildren() && (
              <div className="grw-foldertree-count-wrapper">
                <CountBadge count={ childCount() } />
              </div>
            )}
          </>
        )

        }
        <div className="grw-foldertree-control d-flex">
          <BookmarkFolderItemControl
            onClickRename={onClickRenameHandler}
            onClickDelete={onClickDeleteHandler}
          >
            <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control p-0 grw-visible-on-hover mr-1">
              <i className="icon-options fa fa-rotate-90 p-1"></i>
            </DropdownToggle>
          </BookmarkFolderItemControl>
          <button
            type="button"
            className="border-0 rounded btn btn-page-item-control p-0 grw-visible-on-hover"
            onClick={onClickPlusButton}
          >
            <i className="icon-plus d-block p-0" />
          </button>

        </div>

      </li>
      {isCreateAction && (
        <div className="flex-fill">
          <BookmarkFolderNameInput
            onClickOutside={() => setIsCreateAction(false)}
            onPressEnter={onPressEnterHandlerForCreate}
          />
        </div>
      )}
      {
        RenderChildFolder()
      }
      <DeleteBookmarkFolderModal
        bookmarkFolder={bookmarkFolder}
        isOpen={isDeleteFolderModalShown}
        onClickDeleteButton={onClickDeleteButtonHandler}
        onModalClose={onDeleteFolderModalClose}/>
    </div>
  );
};

export default BookmarkFolderItem;
