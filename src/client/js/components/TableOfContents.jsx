import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import { withUnstatedContainers } from './UnstatedUtils';
import StickyStretchableScroller from './StickyStretchableScroller';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:TableOfContents');

/**
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class TableOfContents
 * @extends {React.Component}
 */
class TableOfContents extends React.Component {

  getContainerTop() {
    // calculate absolute top of '#revision-toc' element
    const containerElem = document.querySelector('#revision-toc');
    return containerElem.getBoundingClientRect().top;
  }

  calcViewHeight() {
    // window height - revisionTocTop - .system-version height
    return window.innerHeight - this.getContainerTop() - 20;
  }

  render() {
    const { tocHtml } = this.props.pageContainer.state;

    return (
      <StickyStretchableScroller
        contentsElemSelector=".revision-toc .markdownIt-TOC"
        stickyElemSelector="#revision-toc"
        calcViewHeightFunc={() => this.calcViewHeight()}
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
  }

}

/**
 * Wrapper component for using unstated
 */
const TableOfContentsWrapper = withUnstatedContainers(TableOfContents, [AppContainer, PageContainer]);

TableOfContents.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(TableOfContentsWrapper);
