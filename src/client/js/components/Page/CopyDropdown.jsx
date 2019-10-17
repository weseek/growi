import React from 'react';
import PropTypes from 'prop-types';

import Dropdown from 'react-bootstrap/es/Dropdown';

import { CopyToClipboard } from 'react-copy-to-clipboard';

export default class CopyDropdown extends React.Component {

  constructor(props) {
    super(props);

    // retrieve xss library from window
    this.xss = window.xss;

    this.generatePageUrl = this.generatePageUrl.bind(this);
  }

  showToolTip() {
    const buttonId = '#copyPagePathDropdown';
    $(buttonId).tooltip('show');
    setTimeout(() => {
      $(buttonId).tooltip('hide');
    }, 1000);
  }

  generatePageUrl() {
    return (this.props.pageId == null)
      ? decodeURIComponent(window.location.pathname + window.location.search)
      : `${window.location.origin}/${this.props.pageId}`;
  }

  generateMarkdownLink() {
    return;
  }

  render() {
    const { t } = this.props;

    const safePagePath = this.xss.process(this.props.pagePath);
    const url = this.generatePageUrl();

    return (
      <Dropdown id="copyPagePathDropdown">

        <Dropdown.Toggle
          className="btn-copy"
          style={this.props.buttonStyle}
          data-toggle="tooltip"
          data-placement="bottom"
          data-trigger="manual"
          title="copied!"
        >
          <i className="ti-clipboard"></i>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <h5 className="ml-3 my-0 text-muted">{ t('copy_to_clipboard.Copy to clipboard') }</h5>
          <span className="divider"></span>

          {/* Page path */}
          <CopyToClipboard text={this.props.pagePath} onCopy={this.showToolTip}>
            <a role="menuitem" tabIndex="-1" href="#">
              <div className="d-inline-flex flex-column">
                <h6 className="mt-1 mb-2"><strong>{ t('copy_to_clipboard.Page path') }</strong></h6>
                <span className="small">{safePagePath}</span>
              </div>
            </a>
          </CopyToClipboard>
          {/* Parmanent Link */}
          { this.props.pageId && (
            <CopyToClipboard text={url} onCopy={this.showToolTip}>
              <a role="menuitem" tabIndex="-1" href="#">
                <div className="d-inline-flex flex-column">
                  <h6 className="mt-1 mb-2"><strong>{ t('copy_to_clipboard.Parmanent link') }</strong></h6>
                  <span className="small">{url}</span>
                </div>
              </a>
            </CopyToClipboard>
          )}
          {/* Page path + Parmanent Link */}
          { this.props.pageId && (
            <CopyToClipboard text={`${this.props.pagePath}\n${url}`} onCopy={this.showToolTip}>
              <a role="menuitem" tabIndex="-1" href="#">
                <div className="d-inline-flex flex-column">
                  <h6 className="mt-1 mb-2"><strong>{ t('copy_to_clipboard.Page path and parmanent link') }</strong></h6>
                  <span className="small mb-1">{safePagePath}</span><br></br>
                  <span className="small">{url}</span>
                </div>
              </a>
            </CopyToClipboard>
          )}
          {/* Markdown Link */}
          { this.props.pageId && (
            <CopyToClipboard text={`[${this.props.pagePath}](${url})`} onCopy={this.showToolTip}>
              <a role="menuitem" tabIndex="-1" href="#">
                <div className="d-inline-flex flex-column">
                  <h6 className="mt-1 mb-2"><strong>{ t('copy_to_clipboard.Markdown link') }</strong></h6>
                  <span className="small">{`[${safePagePath}](${url})`}</span>
                </div>
              </a>
            </CopyToClipboard>
          )}
        </Dropdown.Menu>

      </Dropdown>
    );
  }

}

CopyDropdown.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  pagePath: PropTypes.string.isRequired,
  pageId: PropTypes.string,
  buttonStyle: PropTypes.object,
};
