
import React, { useCallback, useEffect, useState } from 'react';

import { DevidedPagePath } from '@growi/core';
import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip, DropdownToggle } from 'reactstrap';

import { toastError } from '~/client/util/apiNotification';
import { apiv3Get } from '~/client/util/apiv3-client';
import { IPageHasId } from '~/interfaces/page';
import { useCurrentUser, useIsGuestUser } from '~/stores/context';
import loggerFactory from '~/utils/logger';


import { MenuItemType, PageItemControl } from '../Common/Dropdown/PageItemControl';

const logger = loggerFactory('growi:BookmarkList');

// TODO: Remove pagination and apply  scrolling (not infinity)
const ACTIVE_PAGE = 1;

type Props = {
  pages: IPageHasId[]
}

const BookmarksItem = (props: Props) => {
  const { pages } = props;

  const generateBookmarkedPageList = pages.map((page) => {
    const dPagePath = new DevidedPagePath(page.path, false, true);
    const { latter: pageTitle, former: formerPagePath } = dPagePath;
    const bookmarkItemId = `bookmark-item-${page._id}`;
    return (
      <div key={page._id}>
        <li className="list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center" id={bookmarkItemId}>
          <a href={`/${page._id}`} className="grw-bookmarks-title-anchor flex-grow-1">
            <p className={`text-truncate m-auto ${page.isEmpty && 'grw-sidebar-text-muted'}`}>{pageTitle}</p>
          </a>
        </li>

        <PageItemControl
            pageId={page._id}
            isEnableActions
            forceHideMenuItems={[MenuItemType.DUPLICATE]}
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
  const [pages, setPages] = useState<IPageHasId[]>([]);

  const getMyBookmarkList = useCallback(async() => {
    // TODO: Remove pagination and apply  scrolling (not infinity)
    const page = ACTIVE_PAGE;

    try {
      const res = await apiv3Get(`/bookmarks/${currentUser?._id}`, { page });
      const { paginationResult } = res.data;
      setPages(paginationResult.docs.map((page) => {
        return {
          ...page.page,
        };
      }));
    }
    catch (error) {
      logger.error('failed to fetch data', error);
      toastError(error, 'Error occurred in bookmark page list');
    }
  }, [currentUser]);

  useEffect(() => {
    getMyBookmarkList();
  }, [getMyBookmarkList]);

  const renderBar = () => {
    if (isGuestUser) {
      return (
        <h3 className="pl-3">
          { t('Not available for guest') }
        </h3>
      );
    }
    if (pages.length === 0) {
      return (
        <h3 className="pl-3">
          { t('No bookmarks yet') }
        </h3>
      );
    }
    return null;
  };

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <h3 className="mb-0">{t('Bookmarks')}</h3>
      </div>
      { renderBar() }
      <BookmarksItem pages={pages} />
    </>
  );

};

export default Bookmarks;
