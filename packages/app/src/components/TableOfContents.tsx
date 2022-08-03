import React, { useCallback, useEffect, useState } from 'react';

import ReactMarkdown from 'react-markdown';

import { blinkElem } from '~/client/util/blink-section-header';
import { addSmoothScrollEvent } from '~/client/util/smooth-scroll';
import { useIsUserPage } from '~/stores/context';
import { useTocOptions } from '~/stores/renderer';
import loggerFactory from '~/utils/logger';


import { StickyStretchableScroller } from './StickyStretchableScroller';


import styles from './TableOfContents.module.scss';



// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:TableOfContents');

const TableOfContents = (): JSX.Element => {

  const { data: isUserPage } = useIsUserPage();

  const [tocHtml, setTocHtml] = useState('');

  const { data: rendererOptions } = useTocOptions();

  const calcViewHeight = useCallback(() => {
    // calculate absolute top of '#revision-toc' element
    const parentElem = document.querySelector('.grw-side-contents-container');
    const containerElem = document.querySelector('#revision-toc');
    if (parentElem == null || containerElem == null) {
      return 0;
    }
    const parentBottom = parentElem.getBoundingClientRect().bottom;
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
    if (tocDom == null) { return }
    const anchorsInToc = Array.from(tocDom.getElementsByTagName('a'));
    addSmoothScrollEvent(anchorsInToc, blinkElem);
  }, [tocHtml]);

  return (
    <div id="revision-toc" className={`revision-toc ${styles['revision-toc']}`}>
      <StickyStretchableScroller
        stickyElemSelector=".grw-side-contents-sticky-container"
        calcViewHeight={calcViewHeight}
      >
        <div
          id="revision-toc-content"
          className="revision-toc-content mb-3"
        >
          {/* parse blank to show toc (https://github.com/weseek/growi/pull/6277) */}
          <ReactMarkdown {...rendererOptions}>
            {''}
          </ReactMarkdown>
        </div>
      </StickyStretchableScroller>
    </div>
  );

};

export default TableOfContents;
