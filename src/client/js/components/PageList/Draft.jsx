import React from 'react';
import PropTypes from 'prop-types';

import Popover from 'react-bootstrap/lib/Popover';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import { withTranslation } from 'react-i18next';

class Draft extends React.Component {

  constructor(props) {
    super(props);

    this.renderButton = this.renderButton.bind(this);
    this.renderPopover = this.renderPopover.bind(this);
    this.copyMarkdownToClipboard = this.copyMarkdownToClipboard.bind(this);
  }

  renderButton(isExist, markdown) {
    if (isExist) {
      return (
        <button type="button" className="btn-primary p-0" onClick={this.copyMarkdownToClipboard}>
          <span className="icon-doc"></span> Copy
        </button>
      );
    }

    return (
      <a href={`${this.props.path}#edit`} target="_blank" rel="noopener noreferrer">
        <button type="button" className="btn-primary p-0">
          <span className="icon-note"></span>
        </button>
      </a>
    );
  }

  copyMarkdownToClipboard() {
    navigator.clipboard.writeText(this.props.markdown);
  }

  renderPopover(id, markdown) {
    return (
      <Popover id={id}>
        {markdown}
      </Popover>
    );
  }

  render() {
    const { t } = this.props;

    return (
      <li className="page-list-li d-flex align-items-center">
        {this.renderButton(this.props.isExist, this.props.markdown)}
        <button type="button" className="btn-danger p-0" onClick={() => { return this.props.clearDraft(this.props.path) }}>
          <span className="icon-trash"></span>
        </button>
        <OverlayTrigger placement="right" overlay={this.renderPopover(this.props.path, this.props.markdown)}>
          <span onClick={this.copyMarkdownToClipboard}>{this.props.path} {this.props.isExist ? `(${t('page exists')})` : ''}</span>
        </OverlayTrigger>
      </li>
    );
  }

}

Draft.propTypes = {
  t: PropTypes.func.isRequired,
  crowi: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  markdown: PropTypes.string.isRequired,
  isExist: PropTypes.bool.isRequired,
  clearDraft: PropTypes.func.isRequired,
};

export default withTranslation()(Draft);
