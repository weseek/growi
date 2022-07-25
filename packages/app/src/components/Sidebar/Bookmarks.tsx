
import React from 'react';

import { DevidedPagePath } from '@growi/core';
import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip, DropdownToggle } from 'reactstrap';

import { unbookmark } from '~/client/services/page-operation';
import { IPageHasId } from '~/interfaces/page';
import { useSWRCurrentUserBookmark } from '~/stores/bookmark';
import { useCurrentUser, useIsGuestUser } from '~/stores/context';

import { MenuItemType, PageItemControl } from '../Common/Dropdown/PageItemControl';


// TODO: Remove pagination and apply  scrolling (not infinity)
const ACTIVE_PAGE = 1;

type Props = {
  pages: IPageHasId[] | undefined,
  refreshBookmarkList: () => void
}

const BookmarksItem = (props: Props) => {
  const { pages, refreshBookmarkList } = props;

  const generateBookmarkedPageList = pages?.map((page) => {
    const dPagePath = new DevidedPagePath(page.path, false, true);
    const { latter: pageTitle, former: formerPagePath } = dPagePath;
    const bookmarkItemId = `bookmark-item-${page._id}`;

    const bookmarkMenuItemClickHandler = (async() => {
      await unbookmark(page._id);
      refreshBookmarkList();
    });


    return (
      <div className="d-flex justify-content-between" key={page._id}>
        <li className="list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center" id={bookmarkItemId}>
          <a href={`/${page._id}`} className="grw-bookmarks-title-anchor flex-grow-1">
            <p className={`text-truncate m-auto ${page.isEmpty && 'grw-sidebar-text-muted'}`}>{pageTitle}</p>
          </a>
          <PageItemControl
            pageId={page._id}
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
            { formerPagePath || '/' }
          </UncontrolledTooltip>
        </li>
      </div>
    );
  });


  return (
    <>
      <ul className="grw-bookmarks-list list-group p-3">
        <div className="grw-bookmarks-item-container">
          {generateBookmarkedPageList}
        </div>
      </ul>
    </>
  );
};


const Bookmarks = () : JSX.Element => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: pages, mutate: mutateCurrentUserBookmark } = useSWRCurrentUserBookmark(currentUser?._id, ACTIVE_PAGE);


  const renderBookmarksItem = () => {
    if (pages?.length === 0) {
      return (
        <h3 className="pl-3">
          { t('No bookmarks yet') }
        </h3>
      );
    }
    return <BookmarksItem pages={pages} refreshBookmarkList={mutateCurrentUserBookmark} />;
  };

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <h3 className="mb-0">{t('Bookmarks')}</h3>
      </div>

      { isGuestUser
        ? (
          <h3 className="pl-3">
            { t('Not available for guest') }
          </h3>
        ) : renderBookmarksItem()
      }

    </>
  );

};

export default Bookmarks;
