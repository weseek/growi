import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withTranslation } from 'react-i18next';

import PageContainer from '../services/PageContainer';
import NavigationContainer from '../services/NavigationContainer';

import { withUnstatedContainers } from './UnstatedUtils';
import StickyStretchableScroller from './StickyStretchableScroller';

const WIKI_HEADER_LINK = 120;

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:TableOfContents');

/**
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 */
const TableOfContents = (props) => {

  const { pageContainer } = props;

  const calcViewHeight = useCallback(() => {
    // calculate absolute top of '#revision-toc' element
    const containerElem = document.querySelector('#revision-toc');
    const containerTop = containerElem.getBoundingClientRect().top;

    // window height - revisionToc top - .system-version - .grw-fab-container height
    return window.innerHeight - containerTop - 20 - 155;
  }, []);

  const { tocHtml } = pageContainer.state;

  useEffect(() => {
    const tocDom = document.getElementById('revision-toc-content');
    const anchorsInToc = Array.from(tocDom.getElementsByTagName('a'));
    anchorsInToc.forEach(link => link.addEventListener('click', (e) => {
      e.preventDefault();

      window.location.hash = link.getAttribute('href').replace('#', '');
      const huga = document.getElementById(link.getAttribute('href').replace('#', ''));
      props.navigationContainer.smoothScrollIntoView(huga, WIKI_HEADER_LINK);
    }));
  }, [tocHtml]);

  return (
    <>
      {/* TODO GW-3253 add four contents */}
      <StickyStretchableScroller
        contentsElemSelector=".revision-toc .markdownIt-TOC"
        stickyElemSelector="#revision-toc"
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
