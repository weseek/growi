import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import NavigationContainer from '../services/NavigationContainer';

import { withUnstatedContainers } from './UnstatedUtils';

import RecentlyCreatedIcon from './Icons/RecentlyCreatedIcon';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:cli:UserContentsLinks');
const WIKI_HEADER_LINK = 120;

/**
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 */
const BookMarkAndRecentlyCreatedLinkButtons = (props) => {

  const { navigationContainer } = props;

  // get element for smoothScroll
  const getBookMarkListHeaderDom = useMemo(() => { return document.getElementById('bookmarks-list') }, []);
  const getRecentlyCreatedListHeaderDom = useMemo(() => { return document.getElementById('recently-created-list') }, []);


  return (
    <div className="mt-3 d-flex justify-content-between">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={() => navigationContainer.smoothScrollIntoView(getBookMarkListHeaderDom, WIKI_HEADER_LINK)}
      >
        <i className="mr-2 icon-star"></i>
        <span>Bookmarks</span>
      </button>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={() => navigationContainer.smoothScrollIntoView(getRecentlyCreatedListHeaderDom, WIKI_HEADER_LINK)}
      >
        <i className="grw-icon-container-recently-created mr-2"><RecentlyCreatedIcon /></i>
        <span>Recently Created</span>
      </button>
    </div>
  );

};

BookMarkAndRecentlyCreatedLinkButtons.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

const BookMarkAndRecentlyCreatedLinkButtonsWrapper = withUnstatedContainers(BookMarkAndRecentlyCreatedLinkButtons, [NavigationContainer]);
export { BookMarkAndRecentlyCreatedLinkButtonsWrapper };


const CommentLinkButton = (props) => {
  const { navigationContainer } = props;

  // get element for smoothScroll
  const getCommentListDom = useMemo(() => { return document.getElementById('page-comments-list') }, []);

  return (
    <div className="mt-3">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm w-100"
        onClick={() => navigationContainer.smoothScrollIntoView(getCommentListDom, WIKI_HEADER_LINK)}
      >
        <i className="mr-2 icon-fw icon-bubbles"></i>
        <span>Comments</span>
      </button>
    </div>
  );

};

CommentLinkButton.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

const CommentLinkButtonWrapper = withUnstatedContainers(CommentLinkButton, [NavigationContainer]);
export { CommentLinkButtonWrapper };
