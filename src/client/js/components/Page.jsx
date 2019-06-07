import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import MarkdownTable from '../models/MarkdownTable';

import RevisionRenderer from './Page/RevisionRenderer';
import HandsontableModal from './PageEditor/HandsontableModal';
import mtu from './PageEditor/MarkdownTableUtil';

const logger = loggerFactory('growi:Page');

class Page extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentTargetTableArea: null,
    };

    this.growiRenderer = this.props.appContainer.getRenderer('page');

    this.saveHandlerForHandsontableModal = this.saveHandlerForHandsontableModal.bind(this);
  }

  componentWillMount() {
    this.props.appContainer.registerComponentInstance('Page', this);
  }

  /**
   * launch HandsontableModal with data specified by arguments
   * @param beginLineNumber
   * @param endLineNumber
   */
  launchHandsontableModal(beginLineNumber, endLineNumber) {
    const markdown = this.props.pageContainer.state.markdown;
    const tableLines = markdown.split(/\r\n|\r|\n/).slice(beginLineNumber - 1, endLineNumber).join('\n');
    this.setState({ currentTargetTableArea: { beginLineNumber, endLineNumber } });
    this.handsontableModal.show(MarkdownTable.fromMarkdownString(tableLines));
  }

  async saveHandlerForHandsontableModal(markdownTable) {
    const { pageContainer } = this.props;

    const newMarkdown = mtu.replaceMarkdownTableInMarkdown(
      markdownTable,
      this.props.pageContainer.state.markdown,
      this.state.currentTargetTableArea.beginLineNumber,
      this.state.currentTargetTableArea.endLineNumber,
    );

    try {
      // eslint-disable-next-line no-unused-vars
      const { page, tags } = await pageContainer.save(newMarkdown);
      logger.debug('success to save');

      pageContainer.showSuccessToastr();
    }
    catch (error) {
      logger.error('failed to save', error);
      pageContainer.showErrorToastr(error);
    }
    finally {
      this.setState({ currentTargetTableArea: null });
    }
  }

  render() {
    const isMobile = this.props.appContainer.isMobile;
    const { markdown } = this.props.pageContainer.state;

    return (
      <div className={isMobile ? 'page-mobile' : ''}>
        <RevisionRenderer growiRenderer={this.growiRenderer} markdown={markdown} />
        <HandsontableModal ref={(c) => { this.handsontableModal = c }} onSave={this.saveHandlerForHandsontableModal} />
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const PageWrapper = (props) => {
  return createSubscribedElement(Page, props, [AppContainer, PageContainer]);
};


Page.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default PageWrapper;
