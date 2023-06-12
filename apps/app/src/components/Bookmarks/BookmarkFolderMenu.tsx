import React, { useCallback, useMemo, useState } from 'react';

import { getCustomModifiers } from '@growi/ui/dist/utils';
import { useTranslation } from 'next-i18next';
import { DropdownItem, DropdownMenu, UncontrolledDropdown } from 'reactstrap';

import { addBookmarkToFolder, toggleBookmark } from '~/client/util/bookmark-utils';
import { toastError } from '~/client/util/toastr';
import { IBookmarkInfo } from '~/interfaces/bookmark-info';
import { useSWRMUTxCurrentUserBookmarks, useSWRxBookmarkInfo } from '~/stores/bookmark';
import { useSWRxBookmarkFolderAndChild } from '~/stores/bookmark-folder';
import { useCurrentUser } from '~/stores/context';
import { useSWRxPageInfo } from '~/stores/page';

import { BookmarkFolderMenuItem } from './BookmarkFolderMenuItem';

export const BookmarkFolderMenu: React.FC<{children?: React.ReactNode, bookmarkInfo: IBookmarkInfo }> = ({ children, bookmarkInfo }): JSX.Element => {
  const { t } = useTranslation();

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: bookmarkFolders, mutate: mutateBookmarkFolders } = useSWRxBookmarkFolderAndChild(currentUser?._id);
  const { mutate: mutateBookmarkInfo } = useSWRxBookmarkInfo(bookmarkInfo.pageId);

  const { trigger: mutateCurrentUserBookmarks } = useSWRMUTxCurrentUserBookmarks();
  const { mutate: mutatePageInfo } = useSWRxPageInfo(bookmarkInfo.pageId);

  const isBookmarked = bookmarkInfo.isBookmarked ?? false;

  const isBookmarkFolderExists = useMemo((): boolean => {
    return bookmarkFolders != null && bookmarkFolders.length > 0;
  }, [bookmarkFolders]);

  const toggleBookmarkHandler = useCallback(async() => {
    try {
      await toggleBookmark(bookmarkInfo.pageId, isBookmarked);
    }
    catch (err) {
      toastError(err);
    }
  }, [bookmarkInfo.pageId, isBookmarked]);

  const onUnbookmarkHandler = useCallback(async() => {
    await toggleBookmarkHandler();
    setIsOpen(false);
    setSelectedItem(null);
    mutateCurrentUserBookmarks();
    mutateBookmarkInfo();
    mutateBookmarkFolders();
    mutatePageInfo();
  }, [mutateBookmarkFolders, mutateBookmarkInfo, mutatePageInfo, mutateCurrentUserBookmarks, toggleBookmarkHandler]);

  const toggleHandler = useCallback(async() => {
    setIsOpen(!isOpen);

    if (isOpen && bookmarkFolders != null) {
      bookmarkFolders.forEach((bookmarkFolder) => {
        bookmarkFolder.bookmarks.forEach((bookmark) => {
          if (bookmark.page._id === bookmarkInfo.pageId) {
            setSelectedItem(bookmarkFolder._id);
          }
        });
      });
    }

    if (selectedItem == null) {
      setSelectedItem('root');
    }

    if (!isOpen && !isBookmarked) {
      try {
        await toggleBookmarkHandler();
        mutateCurrentUserBookmarks();
        mutateBookmarkInfo();
        mutatePageInfo();
      }
      catch (err) {
        toastError(err);
      }
    }
  },
  // eslint-disable-next-line max-len
  [isOpen, bookmarkFolders, selectedItem, isBookmarked, bookmarkInfo.pageId, toggleBookmarkHandler, mutateCurrentUserBookmarks, mutateBookmarkInfo, mutatePageInfo]);

  const onMenuItemClickHandler = useCallback(async(e, itemId: string) => {
    e.stopPropagation();

    setSelectedItem(itemId);

    try {
      await addBookmarkToFolder(bookmarkInfo.pageId, itemId === 'root' ? null : itemId);
      mutateCurrentUserBookmarks();
      mutateBookmarkFolders();
      mutateBookmarkInfo();
    }
    catch (err) {
      toastError(err);
    }
  }, [bookmarkInfo.pageId, mutateCurrentUserBookmarks, mutateBookmarkFolders, mutateBookmarkInfo]);

  const renderBookmarkMenuItem = () => {
    return (
      <>
        <DropdownItem
          toggle={false}
          onClick={onUnbookmarkHandler}
          className={'grw-bookmark-folder-menu-item text-danger'}
        >
          <i className="fa fa-bookmark"></i>{' '}
          <span className="mx-2 ">
            {t('bookmark_folder.cancel_bookmark')}
          </span>
        </DropdownItem>

        {isBookmarkFolderExists && (
          <>
            <DropdownItem divider />
            <div key="root">
              <div
                className="dropdown-item grw-bookmark-folder-menu-item list-group-item list-group-item-action border-0 py-0"
                tabIndex={0}
                role="menuitem"
                onClick={e => onMenuItemClickHandler(e, 'root')}
              >
                <BookmarkFolderMenuItem
                  itemId="root"
                  itemName={t('bookmark_folder.root')}
                  isSelected={selectedItem === 'root'}
                />
              </div>
            </div>
            {bookmarkFolders?.map(folder => (
              <div key={folder._id}>
                <div
                  className="dropdown-item grw-bookmark-folder-menu-item list-group-item list-group-item-action border-0 py-0"
                  style={{ paddingLeft: '40px' }}
                  tabIndex={0}
                  role="menuitem"
                  onClick={e => onMenuItemClickHandler(e, folder._id)}
                >
                  <BookmarkFolderMenuItem
                    itemId={folder._id}
                    itemName={folder.name}
                    isSelected={selectedItem === folder._id}
                  />
                </div>
                {folder.children?.map(child => (
                  <div key={child._id}>
                    <div
                      className='dropdown-item grw-bookmark-folder-menu-item list-group-item list-group-item-action border-0 py-0'
                      style={{ paddingLeft: '60px' }}
                      tabIndex={0}
                      role="menuitem"
                      onClick={e => onMenuItemClickHandler(e, child._id)}
                    >
                      <BookmarkFolderMenuItem
                        itemId={child._id}
                        itemName={child.name}
                        isSelected={selectedItem === child._id}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <UncontrolledDropdown
      isOpen={isOpen}
      onToggle={toggleHandler}
      direction={isBookmarkFolderExists ? 'up' : 'down'}
      className='grw-bookmark-folder-dropdown'
    >
      {children}
      <DropdownMenu
        right
        persist
        positionFixed
        className='grw-bookmark-folder-menu'
        modifiers={getCustomModifiers(true)}
      >
        { renderBookmarkMenuItem() }
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};
