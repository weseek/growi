import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { pagePathUtils } from '@growi/core';
import AppContainer from '~/client/services/AppContainer';
import NavigationContainer from '~/client/services/NavigationContainer';
import PageContainer from '~/client/services/PageContainer';

import { withUnstatedContainers } from './UnstatedUtils';

import RecentlyCreatedIcon from './Icons/RecentlyCreatedIcon';

const { isTopPage } = pagePathUtils;

const WIKI_HEADER_LINK = 120;

/**
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 */
const ContentLinkButtons = (props) => {

  const { appContainer, navigationContainer, pageContainer } = props;
  const { pageUser, path } = pageContainer.state;
  const { isPageExist } = pageContainer.state;
  const { isSharedUser } = appContainer;

  const isTopPagePath = isTopPage(path);

  // get element for smoothScroll
  const getCommentListDom = useMemo(() => { return document.getElementById('page-comments-list') }, []);
  const getBookMarkListHeaderDom = useMemo(() => { return document.getElementById('bookmarks-list') }, []);
  const getRecentlyCreatedListHeaderDom = useMemo(() => { return document.getElementById('recently-created-list') }, []);


  const CommentLinkButton = () => {
    return (
      <div className="mt-3">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm btn-block"
          onClick={() => navigationContainer.smoothScrollIntoView(getCommentListDom, WIKI_HEADER_LINK)}
        >
          <i className="mr-2 icon-fw icon-bubbles"></i>
          <span>Comments</span>
        </button>
      </div>
    );
  };

  const BookMarkLinkButton = () => {
    return (
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm px-2"
        onClick={() => navigationContainer.smoothScrollIntoView(getBookMarkListHeaderDom, WIKI_HEADER_LINK)}
      >
        <i className="mr-2 icon-star"></i>
        <span>Bookmarks</span>
      </button>

    );
  };

  const RecentlyCreatedLinkButton = () => {
    return (
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm px-3"
        onClick={() => navigationContainer.smoothScrollIntoView(getRecentlyCreatedListHeaderDom, WIKI_HEADER_LINK)}
      >
        <i className="grw-icon-container-recently-created mr-2"><RecentlyCreatedIcon /></i>
        <span>Recently Created</span>
      </button>

    );
  };

  return (
    <>
      {isPageExist && !isSharedUser && !isTopPagePath && <CommentLinkButton />}

      <div className="mt-3 d-flex justify-content-between">
        {pageUser && <><BookMarkLinkButton /><RecentlyCreatedLinkButton /></>}
      </div>
    </>
  );

};

ContentLinkButtons.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withUnstatedContainers(ContentLinkButtons, [AppContainer, NavigationContainer, PageContainer]);
