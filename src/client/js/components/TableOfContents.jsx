import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { debounce } from 'throttle-debounce';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import { createSubscribedElement } from './UnstatedUtils';

// get these value with
//   document.querySelector('.revision-toc').getBoundingClientRect().top
const DEFAULT_REVISION_TOC_TOP_FOR_GROWI_LAYOUT = 190;
const DEFAULT_REVISION_TOC_TOP_FOR_KIBELA_LAYOUT = 105;

/**
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class TableOfContents
 * @extends {React.Component}
 */
class TableOfContents extends React.Component {

  constructor(props) {
    super(props);

    this.resetScrollbarDebounced = debounce(100, this.resetScrollbar);
  }

  componentDidUpdate() {
    const { layoutType } = this.props.appContainer.config;
    if (layoutType === 'crowi') {
      return;
    }

    let defaultRevisionTocTop = DEFAULT_REVISION_TOC_TOP_FOR_GROWI_LAYOUT;
    if (layoutType === 'kibela') {
      defaultRevisionTocTop = DEFAULT_REVISION_TOC_TOP_FOR_KIBELA_LAYOUT;
    }

    // initialize
    this.resetScrollbar(defaultRevisionTocTop);

    /*
     * set event listener
     */
    // resize
    window.addEventListener('resize', (event) => {
      this.resetScrollbarDebounced(defaultRevisionTocTop);
    });
    // affix on
    $('#revision-toc').on('affixed.bs.affix', () => {
      this.resetScrollbar(this.getCurrentRevisionTocTop());
    });
    // affix off
    $('#revision-toc').on('affixed-top.bs.affix', () => {
      this.resetScrollbar(defaultRevisionTocTop);
    });
  }

  getCurrentRevisionTocTop() {
    // calculate absolute top of '#revision-toc' element
    const revisionTocElem = document.querySelector('.revision-toc');
    return revisionTocElem.getBoundingClientRect().top;
  }

  resetScrollbar(revisionTocTop) {
    const tocContentElem = document.querySelector('.revision-toc .markdownIt-TOC');

    // window height - revisionTocTop - .system-version height
    let h = window.innerHeight - revisionTocTop - 20;

    const tocContentHeight = tocContentElem.getBoundingClientRect().height + 15; // add margin

    h = Math.min(h, tocContentHeight);

    $('#revision-toc-content').slimScroll({
      railVisible: true,
      position: 'right',
      height: h,
    });
  }

  render() {
    const { tocHtml } = this.props.pageContainer.state;

    return (
      <div
        id="revision-toc-content"
        className="revision-toc-content"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: tocHtml,
        }}
      />
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const TableOfContentsWrapper = (props) => {
  return createSubscribedElement(TableOfContents, props, [AppContainer, PageContainer]);
};

TableOfContents.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(TableOfContentsWrapper);
