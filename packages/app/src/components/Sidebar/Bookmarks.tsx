
import React, { useCallback } from 'react';

import { DevidedPagePath, pathUtils } from '@growi/core';
import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip, DropdownToggle } from 'reactstrap';

import { unbookmark } from '~/client/services/page-operation';
import { IPageHasId } from '~/interfaces/page';
import { useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useIsGuestUser } from '~/stores/context';

import { MenuItemType, PageItemControl } from '../Common/Dropdown/PageItemControl';


type Props = {
  bookmarkedPage: IPageHasId,
  onPageOperationSuccess: () => void
}

const BookmarkItem = (props: Props) => {
  const { bookmarkedPage, onPageOperationSuccess } = props;

  const dPagePath = new DevidedPagePath(bookmarkedPage.path, false, true);
  const { latter: pageTitle, former, isRoot } = dPagePath;
  const formerPagePath = isRoot ? pageTitle : pathUtils.addTrailingSlash(former);
  const bookmarkItemId = `bookmark-item-${bookmarkedPage._id}`;

  const bookmarkMenuItemClickHandler = useCallback(async() => {
    await unbookmark(bookmarkedPage._id);
    onPageOperationSuccess();
  }, [onPageOperationSuccess, bookmarkedPage]);


  return (
    <div className="d-flex justify-content-between" key={bookmarkedPage._id}>
      <li className="list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center" id={bookmarkItemId}>
        <a href={`/${bookmarkedPage._id}`} className="grw-bookmarks-title-anchor flex-grow-1">
          <p className={`text-truncate m-auto ${bookmarkedPage.isEmpty && 'grw-sidebar-text-muted'}`}>{pageTitle}</p>
        </a>
        <PageItemControl
          pageId={bookmarkedPage._id}
          isEnableActions
          forceHideMenuItems={[MenuItemType.DUPLICATE]}
          onClickBookmarkMenuItem={bookmarkMenuItemClickHandler}
        >
          <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control p-0 grw-visible-on-hover mr-1">
            <i className="icon-options fa fa-rotate-90 p-1"></i>
          </DropdownToggle>
        </PageItemControl>
        <UncontrolledTooltip
          modifiers={{ preventOverflow: { boundariesElement: 'window' } }}
          autohide={false}
          placement="right"
          target={bookmarkItemId}
        >
          { formerPagePath }
        </UncontrolledTooltip>
      </li>
    </div>
  );
};


const Bookmarks = () : JSX.Element => {
  const { t } = useTranslation();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: currentUserBookmarksData, mutate: mutateCurrentUserBookmarks } = useSWRxCurrentUserBookmarks();

  const generateBookmarkList = () => {
    return (
      <ul className="grw-bookmarks-list list-group p-3">
        <div className="grw-bookmarks-item-container">
          { currentUserBookmarksData?.map((currentUserBookmark) => {
            return (
              <BookmarkItem key={currentUserBookmark._id} bookmarkedPage={currentUserBookmark} onPageOperationSuccess={mutateCurrentUserBookmarks} />
            );
          })}
        </div>
      </ul>
    );
  };

  const renderBookmarksItem = () => {
    if (currentUserBookmarksData?.length === 0) {
      return (
        <h4 className="pl-3">
          { t('No bookmarks yet') }
        </h4>
      );
    }
    return generateBookmarkList();
  };

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <h3 className="mb-0">{t('Bookmarks')}</h3>
      </div>
      { isGuestUser
        ? (
          <h4 className="pl-3">
            { t('Not available for guest') }
          </h4>
        ) : renderBookmarksItem()
      }
    </>
  );
};

export default Bookmarks;
