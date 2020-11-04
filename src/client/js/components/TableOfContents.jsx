import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withTranslation } from 'react-i18next';

import PageContainer from '../services/PageContainer';
import NavigationContainer from '../services/NavigationContainer';

import { withUnstatedContainers } from './UnstatedUtils';

import StickyStretchableScroller from './StickyStretchableScroller';

import RecentlyCreatedIcon from './Icons/RecentlyCreatedIcon';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:TableOfContents');
const WIKI_HEADER_LINK = 120;

/**
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 */
const TableOfContents = (props) => {

  const { pageContainer, navigationContainer } = props;
  const { pageUser } = pageContainer.state;
  const isUserPage = pageUser != null;

  const calcViewHeight = useCallback(() => {
    // calculate absolute top of '#revision-toc' element
    const parentElem = document.querySelector('.grw-side-contents-container');
    const parentBottom = parentElem.getBoundingClientRect().bottom;
    const containerElem = document.querySelector('#revision-toc');
    const containerTop = containerElem.getBoundingClientRect().top;
    const containerComputedStyle = getComputedStyle(containerElem);
    const containerPaddingTop = parseFloat(containerComputedStyle['padding-top']);

    // get smaller bottom line of window height - .system-version height) and containerTop
    const bottom = Math.min(window.innerHeight - 20, parentBottom);

    console.log('calcViewHeight', {
      windowInnerHeight: window.innerHeight,
      parentBottom,
      containerTop,
      viewHeight1: bottom - containerTop,
      viewHeight2: bottom - (containerTop + containerPaddingTop),
    });

    // if (isUserPage) {
    //   return window.innerHeight - containerTop - 20 - 155 - 26 - 40;
    // }
    // bottom - revisionToc top
    return bottom - (containerTop + containerPaddingTop);
  }, []);

  const { tocHtml } = pageContainer.state;

  // execute after generation toc html
  useEffect(() => {
    const tocDom = document.getElementById('revision-toc-content');
    const anchorsInToc = Array.from(tocDom.getElementsByTagName('a'));
    navigationContainer.addSmoothScrollEvent(anchorsInToc);
  }, [tocHtml, navigationContainer]);

  // get element for smoothScroll
  const getBookMarkListHeaderDom = useMemo(() => { return document.getElementById('bookmarks-list') }, []);
  const getRecentlyCreatedListHeaderDom = useMemo(() => { return document.getElementById('recently-created-list') }, []);

  return (
    <>
      <StickyStretchableScroller
        contentsElemSelector=".revision-toc .markdownIt-TOC"
        stickyElemSelector=".grw-side-contents-sticky-container"
        calcViewHeightFunc={calcViewHeight}
      >
        <div
          id="revision-toc-content"
          className="revision-toc-content"
         // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
          __html: tocHtml,
        }}
        />
      </StickyStretchableScroller>

      { isUserPage && (
      <div className="mt-3 d-flex justify-content-around">
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
      )}
    </>
  );

};

/**
 * Wrapper component for using unstated
 */
const TableOfContentsWrapper = withUnstatedContainers(TableOfContents, [PageContainer, NavigationContainer]);

TableOfContents.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withTranslation()(TableOfContentsWrapper);
