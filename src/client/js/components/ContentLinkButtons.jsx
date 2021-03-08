import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { isTopPage } from '~/utils/path-utils';

import NavigationContainer from '../services/NavigationContainer';
import PageContainer from '../services/PageContainer';

import { withUnstatedContainers } from './UnstatedUtils';

import RecentlyCreatedIcon from './Icons/RecentlyCreatedIcon';
import { useIsSharedUser } from '~/stores/context';

const WIKI_HEADER_LINK = 120;

/**
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 */
const ContentLinkButtons = (props) => {

  const { navigationContainer, pageContainer } = props;
  const { pageUser, path } = pageContainer.state;
  const { isPageExist } = pageContainer.state;
  const { data: isSharedUser } = useIsSharedUser();

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
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withUnstatedContainers(ContentLinkButtons, [NavigationContainer, PageContainer]);
