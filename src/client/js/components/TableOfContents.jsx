import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withTranslation } from 'react-i18next';

import PageContainer from '../services/PageContainer';

import { withUnstatedContainers } from './UnstatedUtils';
import StickyStretchableScroller from './StickyStretchableScroller';

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

    // window height - revisionToc top - .system-version height
    return window.innerHeight - containerTop - 20;
  });

  const { tocHtml } = pageContainer.state;

  return (
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
  );

};

/**
 * Wrapper component for using unstated
 */
const TableOfContentsWrapper = withUnstatedContainers(TableOfContents, [PageContainer]);

TableOfContents.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(TableOfContentsWrapper);
