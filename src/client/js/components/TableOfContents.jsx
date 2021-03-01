import React, { useCallback, useEffect } from 'react';
import loggerFactory from '~/utils/logger';

import { useTranslation } from '~/i18n';
import { useCurrentPageTocNode } from '~/stores/renderer';

import StickyStretchableScroller from './StickyStretchableScroller';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:TableOfContents');

/**
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 */
const TableOfContents = (props) => {
  const { t } = useTranslation();
  const { data: tocNode } = useCurrentPageTocNode();

  // const { pageUser } = pageContainer.state;
  // const isUserPage = pageUser != null;

  const calcViewHeight = useCallback(() => {
  //   // calculate absolute top of '#revision-toc' element
  //   const parentElem = document.querySelector('.grw-side-contents-container');
  //   const parentBottom = parentElem.getBoundingClientRect().bottom;
  //   const containerElem = document.querySelector('#revision-toc');
  //   const containerTop = containerElem.getBoundingClientRect().top;
  //   const containerComputedStyle = getComputedStyle(containerElem);
  //   const containerPaddingTop = parseFloat(containerComputedStyle['padding-top']);

    //   // get smaller bottom line of window height - .system-version height) and containerTop
    //   let bottom = Math.min(window.innerHeight - 20, parentBottom);

  //   if (isUserPage) {
  //     // raise the bottom line by the height and margin-top of UserContentLinks
  //     bottom -= 45;
  //   }
  //   // bottom - revisionToc top
  //   return bottom - (containerTop + containerPaddingTop);
  // }, [isUserPage]);
  }, []);

  if (tocNode == null) {
    return <></>;
  }

  // execute after generation toc html
  // useEffect(() => {
  //   const tocDom = document.getElementById('revision-toc-content');
  //   const anchorsInToc = Array.from(tocDom.getElementsByTagName('a'));
  //   navigationContainer.addSmoothScrollEvent(anchorsInToc);
  // }, [tocHtml, navigationContainer]);

  // TODO: render tocNode
  logger.info('TODO: render tocNode', tocNode);

  return (
    <div>
      TODO: render tocNode
    </div>
  );

  // return (
  //   <StickyStretchableScroller
  //     contentsElemSelector=".revision-toc .markdownIt-TOC"
  //     stickyElemSelector=".grw-side-contents-sticky-container"
  //     calcViewHeightFunc={calcViewHeight}
  //   >
  //     { tocNode !== ''
  //     ? (
  //       <div
  //         id="revision-toc-content"
  //         className="revision-toc-content mb-3"
  //         // eslint-disable-next-line react/no-danger
  //         // dangerouslySetInnerHTML={{ __html: tocHtml }}
  //       >
  //         {processor.runSync(tocNode).result}
  //       </div>
  //     )
  //     : (
  //       <div
  //         id="revision-toc-content"
  //         className="revision-toc-content mb-2"
  //       >
  //         <span className="text-muted">({t('page_table_of_contents.empty')})</span>
  //       </div>
  //     ) }

  //   </StickyStretchableScroller>
  // );

};

export default TableOfContents;
