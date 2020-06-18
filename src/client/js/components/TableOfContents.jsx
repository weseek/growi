import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withTranslation } from 'react-i18next';

import { debounce } from 'throttle-debounce';
import StickyEvents from 'sticky-events';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import { isUserPage } from '../../../lib/util/path-utils';
import { withUnstatedContainers } from './UnstatedUtils';

const logger = loggerFactory('growi:TableOfContents');

// get these value with
//   document.querySelector('.revision-toc').getBoundingClientRect().top
const DEFAULT_REVISION_TOC_TOP_FOR_GROWI_LAYOUT = 204;
const DEFAULT_REVISION_TOC_TOP_FOR_GROWI_LAYOUT_USER_PAGE = 264;
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

    this.init = this.init.bind(this);
    this.resetScrollbarDebounced = debounce(100, this.resetScrollbar);

    const { layoutType } = this.props.appContainer.config;
    const { path } = this.props.pageContainer.state;

    this.defaultRevisionTocTop = DEFAULT_REVISION_TOC_TOP_FOR_GROWI_LAYOUT;

    if (isUserPage(path)) {
      this.defaultRevisionTocTop = DEFAULT_REVISION_TOC_TOP_FOR_GROWI_LAYOUT_USER_PAGE;
    }

    if (layoutType === 'kibela') {
      this.defaultRevisionTocTop = DEFAULT_REVISION_TOC_TOP_FOR_KIBELA_LAYOUT;
    }
  }

  componentDidMount() {
    this.init();
    this.resetScrollbar();
  }

  componentDidUpdate() {
    this.resetScrollbar();
  }

  init() {
    /*
     * set event listener
     */
    // resize
    window.addEventListener('resize', (event) => {
      this.resetScrollbarDebounced(this.defaultRevisionTocTop);
    });

    // sticky
    // See: https://github.com/ryanwalters/sticky-events
    const stickyEvents = new StickyEvents({
      stickySelector: '#revision-toc',
    });
    const { stickySelector } = stickyEvents;
    const elem = document.querySelector(stickySelector);
    elem.addEventListener(StickyEvents.STUCK, (event) => {
      logger.debug('StickyEvents.STUCK detected');
      this.resetScrollbar();
    });
    elem.addEventListener(StickyEvents.UNSTUCK, (event) => {
      logger.debug('StickyEvents.UNSTUCK detected');
      this.resetScrollbar(this.defaultRevisionTocTop);
    });
  }

  getCurrentRevisionTocTop() {
    // calculate absolute top of '#revision-toc' element
    const revisionTocElem = document.querySelector('.revision-toc');
    return revisionTocElem.getBoundingClientRect().top;
  }

  resetScrollbar(defaultRevisionTocTop) {
    const tocContentElem = document.querySelector('.revision-toc .markdownIt-TOC');

    if (tocContentElem == null) {
      return;
    }

    const revisionTocTop = defaultRevisionTocTop || this.getCurrentRevisionTocTop();
    // window height - revisionTocTop - .system-version height
    const viewHeight = window.innerHeight - revisionTocTop - 20;

    const tocContentHeight = tocContentElem.getBoundingClientRect().height + 15; // add margin

    logger.debug('viewHeight', viewHeight);
    logger.debug('tocContentHeight', tocContentHeight);

    if (viewHeight < tocContentHeight) {
      $('#revision-toc-content').slimScroll({
        railVisible: true,
        position: 'right',
        height: viewHeight,
      });
    }
    else {
      $('#revision-toc-content').slimScroll({ destroy: true });
    }
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
const TableOfContentsWrapper = withUnstatedContainers(TableOfContents, [AppContainer, PageContainer]);

TableOfContents.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(TableOfContentsWrapper);
