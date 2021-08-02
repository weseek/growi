import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '~/utils/logger';


import PageContainer from '~/client/services/PageContainer';
import NavigationContainer from '~/client/services/NavigationContainer';

import { withUnstatedContainers } from './UnstatedUtils';

import StickyStretchableScroller from './StickyStretchableScroller';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:TableOfContents');

/**
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 */
const TableOfContents = (props) => {

  const { t, pageContainer, navigationContainer } = props;
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

    // get smaller bottom line of window height - the height of ContentLinkButtons and .system-version height) and containerTop
    let bottom = Math.min(window.innerHeight - 41 - 20, parentBottom);

    if (isUserPage) {
      // raise the bottom line by the height and margin-top of UserContentLinks
      bottom -= 45;
    }
    // bottom - revisionToc top
    return bottom - (containerTop + containerPaddingTop);
  }, [isUserPage]);

  const { tocHtml } = pageContainer.state;

  // execute after generation toc html
  useEffect(() => {
    const tocDom = document.getElementById('revision-toc-content');
    const anchorsInToc = Array.from(tocDom.getElementsByTagName('a'));
    navigationContainer.addSmoothScrollEvent(anchorsInToc);
  }, [tocHtml, navigationContainer]);

  return (
    <StickyStretchableScroller
      contentsElemSelector=".revision-toc .markdownIt-TOC"
      stickyElemSelector=".grw-side-contents-sticky-container"
      calcViewHeightFunc={calcViewHeight}
    >
      { tocHtml !== ''
        ? (
          <div
            id="revision-toc-content"
            className="revision-toc-content mb-3"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: tocHtml }}
          />
        )
        : (
          <div
            id="revision-toc-content"
            className="revision-toc-content mb-2"
          >
            <span className="text-muted">({t('page_table_of_contents.empty')})</span>
          </div>
        ) }

    </StickyStretchableScroller>
  );

};

/**
 * Wrapper component for using unstated
 */
const TableOfContentsWrapper = withUnstatedContainers(TableOfContents, [PageContainer, NavigationContainer]);

TableOfContents.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withTranslation()(TableOfContentsWrapper);
