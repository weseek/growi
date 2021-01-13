import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import NavigationContainer from '../services/NavigationContainer';

import { withUnstatedContainers } from './UnstatedUtils';

const WIKI_HEADER_LINK = 120;

/**
 * @author Kaori Tokashiki <kaori@weseek.co.jp>
 *
 */
const CommentLinkButton = (props) => {

  const { navigationContainer } = props;

  // get element for smoothScroll
  const getCommentListDom = useMemo(() => { return document.getElementById('page-comments-list') }, []);

  return (
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm"
      onClick={() => navigationContainer.smoothScrollIntoView(getCommentListDom, WIKI_HEADER_LINK)}
    >
      <i className="mr-2 icon-fw icon-bubbles"></i>
      <span>Comments</span>
    </button>
  );

};

CommentLinkButton.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withUnstatedContainers(CommentLinkButton, [NavigationContainer]);
