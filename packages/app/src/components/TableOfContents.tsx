import React, { useCallback, useEffect, useState } from 'react';

import ReactMarkdown from 'react-markdown';

import { blinkElem } from '~/client/util/blink-section-header';
import { addSmoothScrollEvent } from '~/client/util/smooth-scroll';
import { useIsUserPage } from '~/stores/context';
import { useTocOptions } from '~/stores/renderer';
import loggerFactory from '~/utils/logger';


import { StickyStretchableScroller } from './StickyStretchableScroller';

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

  // == TODO: render ToC without globalEmitter -- Yuki Takei
  //
  // set handler to render ToC
  // useEffect(() => {
  //   const handler = html => setTocHtml(html);
  //   globalEmitter.on('renderTocHtml', handler);

  //   return function cleanup() {
  //     globalEmitter.removeListener('renderTocHtml', handler);
  //   };
  // }, [globalEmitter]);

  return (
    <StickyStretchableScroller
      stickyElemSelector=".grw-side-contents-sticky-container"
      calcViewHeight={calcViewHeight}
    >
      <ReactMarkdown {...rendererOptions}>
        {''}
      </ReactMarkdown>
      {/* { tocHtml !== ''
        ? (
          // <div
          //   id="revision-toc-content"
          //   className="revision-toc-content mb-3"
          //   // eslint-disable-next-line react/no-danger
          //   dangerouslySetInnerHTML={{ __html: tocHtml }}
          // />
          <ReactMarkdown {...rendererOptions}>
            {''}
          </ReactMarkdown>
        )
        : (
          <div
            id="revision-toc-content"
            className="revision-toc-content mb-2"
          >
          </div>
        ) } */}

    </StickyStretchableScroller>
  );

};

export default TableOfContents;
