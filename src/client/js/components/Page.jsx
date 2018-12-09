import React from 'react';
import PropTypes from 'prop-types';

import RevisionRenderer from './Page/RevisionRenderer';
import HandsontableModal from './PageEditor/HandsontableModal';
import MarkdownTable from '../models/MarkdownTable';
import mtu from './PageEditor/MarkdownTableUtil';

export default class Page extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      markdown: this.props.markdown,
      currentTargetTableArea: null
    };

    this.saveHandlerForHandsontableModal = this.saveHandlerForHandsontableModal.bind(this);
  }

  setMarkdown(markdown) {
    this.setState({ markdown });
  }

  /**
   * launch HandsontableModal with data specified by arguments
   * @param beginLineNumber
   * @param endLineNumber
   */
  launchHandsontableModal(beginLineNumber, endLineNumber) {
    const tableLines = this.state.markdown.split(/\r\n|\r|\n/).slice(beginLineNumber - 1, endLineNumber).join('\n');
    this.setState({currentTargetTableArea: {beginLineNumber, endLineNumber}});
    this.refs.handsontableModal.show(MarkdownTable.fromMarkdownString(tableLines));
  }

  saveHandlerForHandsontableModal(markdownTable) {
    const newMarkdown = mtu.replaceMarkdownTableInMarkdown(markdownTable, this.state.markdown, this.state.currentTargetTableArea.beginLineNumber, this.state.currentTargetTableArea.endLineNumber);
    this.props.onSaveWithShortcut(newMarkdown);
    this.setState({currentTargetTableArea: null});
  }

  render() {
    const isMobile = this.props.crowi.isMobile;

    return <div className={isMobile ? 'page-mobile' : ''}>
      <RevisionRenderer
          crowi={this.props.crowi} crowiRenderer={this.props.crowiRenderer}
          markdown={this.state.markdown}
          pagePath={this.props.pagePath}
      />
      <HandsontableModal ref='handsontableModal' onSave={this.saveHandlerForHandsontableModal} />
    </div>;
  }
}

Page.propTypes = {
  crowi: PropTypes.object.isRequired,
  crowiRenderer: PropTypes.object.isRequired,
  onSaveWithShortcut: PropTypes.func.isRequired,
  markdown: PropTypes.string.isRequired,
  pagePath: PropTypes.string.isRequired,
  showHeadEditButton: PropTypes.bool,
};
