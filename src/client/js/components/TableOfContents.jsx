import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withTranslation } from 'react-i18next';

import PageContainer from '../services/PageContainer';
import NavigationContainer from '../services/NavigationContainer';

import { withUnstatedContainers } from './UnstatedUtils';
import TopOfTableContents from './TopOfTableContents';
import StickyStretchableScroller from './StickyStretchableScroller';

import RecentlyCreatedIcon from './Icons/RecentlyCreatedIcon';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:TableOfContents');

/**
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 */
const TableOfContents = (props) => {

  const { pageContainer, navigationContainer, isGuestUserMode } = props;
  const { pageUser } = pageContainer.state;
  const isUserPage = pageUser != null;

  const calcViewHeight = useCallback(() => {
    // calculate absolute top of '#revision-toc' element
    const containerElem = document.querySelector('#revision-toc');
    const containerTop = containerElem.getBoundingClientRect().top;

    // window height - revisionToc top - .system-version - .grw-fab-container height - top-of-table-contents height
    if (isUserPage) {
      return window.innerHeight - containerTop - 20 - 155 - 26 - 40;
    }
    return window.innerHeight - containerTop - 20 - 155 - 26;
  }, []);

  const { tocHtml } = pageContainer.state;

  // execute after generation toc html
  useEffect(() => {
    const tocDom = document.getElementById('revision-toc-content');
    const anchorsInToc = Array.from(tocDom.getElementsByTagName('a'));
    navigationContainer.addSmoothScrollEvent(anchorsInToc);
  }, [tocHtml, navigationContainer]);

  return (
    <>
      <TopOfTableContents isGuestUserMode={isGuestUserMode} />
      <StickyStretchableScroller
        contentsElemSelector=".revision-toc .markdownIt-TOC"
        stickyElemSelector="#revision-toc"
        calcViewHeightFunc={calcViewHeight}
      >
        <div
          id="revision-toc-content"
          className="revision-toc-content top-of-table-contents"
         // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
          __html: tocHtml,
        }}
        />
      </StickyStretchableScroller>

      { isUserPage && (
      <div className="mt-3 d-flex justify-content-around">
        <a className="btn btn-outline-secondary btn-sm" href="#">
          <i className="mr-2 icon-star"></i>
          <span>Bookmarks</span>
        </a>
        <a className="btn btn-outline-secondary btn-sm" href="#">
          <i className="grw-icon-container-recently-created mr-2"><RecentlyCreatedIcon /></i>
          <span>Recently Created</span>
        </a>
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

  isGuestUserMode: PropTypes.bool.isRequired,
};

export default withTranslation()(TableOfContentsWrapper);
