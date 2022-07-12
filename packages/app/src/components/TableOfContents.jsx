import React, { useCallback, useEffect, useState } from 'react';

import PropTypes from 'prop-types';


import PageContainer from '~/client/services/PageContainer';
import { blinkElem } from '~/client/util/blink-section-header';
import { addSmoothScrollEvent } from '~/client/util/smooth-scroll';
import { useGlobalEventEmitter } from '~/stores/context';
import loggerFactory from '~/utils/logger';


import { StickyStretchableScroller } from './StickyStretchableScroller';
import { withUnstatedContainers } from './UnstatedUtils';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:TableOfContents');

/**
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 */
const TableOfContents = (props) => {

  const { pageContainer } = props;
  const { pageUser } = pageContainer.state;
  const isUserPage = pageUser != null;

  const { data: globalEmitter } = useGlobalEventEmitter();

  const [tocHtml, setTocHtml] = useState('');

  const calcViewHeight = useCallback(() => {
    // calculate absolute top of '#revision-toc' element
    const parentElem = document.querySelector('.grw-side-contents-container');
    const parentBottom = parentElem.getBoundingClientRect().bottom;
    const containerElem = document.querySelector('#revision-toc');
    const containerTop = containerElem.getBoundingClientRect().top;
    const containerComputedStyle = getComputedStyle(containerElem);
    const containerPaddingTop = parseFloat(containerComputedStyle['padding-top']);

    // get smaller bottom line of window height - .system-version height - margin 5px) and containerTop
    let bottom = Math.min(window.innerHeight - 20 - 5, parentBottom);

    if (isUserPage) {
      // raise the bottom line by the height and margin-top of UserContentLinks
      bottom -= 45;
    }
    // bottom - revisionToc top
    return bottom - (containerTop + containerPaddingTop);
  }, [isUserPage]);

  useEffect(() => {
    const tocDom = document.getElementById('revision-toc-content');
    const anchorsInToc = Array.from(tocDom.getElementsByTagName('a'));
    addSmoothScrollEvent(anchorsInToc, blinkElem);
  }, [tocHtml]);

  // set handler to render ToC
  useEffect(() => {
    const handler = html => setTocHtml(html);
    globalEmitter.on('renderTocHtml', handler);

    return function cleanup() {
      globalEmitter.removeListener('renderTocHtml', handler);
    };
  }, [globalEmitter]);

  return (
    <StickyStretchableScroller
      stickyElemSelector=".grw-side-contents-sticky-container"
      calcViewHeight={calcViewHeight}
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
          </div>
        ) }

    </StickyStretchableScroller>
  );

};

/**
 * Wrapper component for using unstated
 */
const TableOfContentsWrapper = withUnstatedContainers(TableOfContents, [PageContainer]);

TableOfContents.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default TableOfContentsWrapper;
