import React from 'react';
import PropTypes from 'prop-types';

import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
  Tooltip,
} from 'reactstrap';

import { CopyToClipboard } from 'react-copy-to-clipboard';

export default class CopyDropdown extends React.Component {

  constructor(props) {
    super(props);

    // retrieve xss library from window
    this.xss = window.xss;

    this.state = {
      dropdownOpen: false,
      tooltipOpen: false,
    };

    this.toggle = this.toggle.bind(this);
    this.showToolTip = this.showToolTip.bind(this);
    this.generatePageUrl = this.generatePageUrl.bind(this);
  }

  toggle() {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  showToolTip() {
    this.setState({ tooltipOpen: true });
    setTimeout(() => {
      this.setState({ tooltipOpen: false });
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
      <>
        <Dropdown id="copyPagePathDropdown" isOpen={this.state.dropdownOpen} toggle={this.toggle}>

          <DropdownToggle
            caret
            className="btn-copy"
            style={this.props.buttonStyle}
          >
            <i className="ti-clipboard"></i>
          </DropdownToggle>

          <DropdownMenu>
            <h5 className="ml-3 my-0 text-muted">{ t('copy_to_clipboard.Copy to clipboard') }</h5>
            <DropdownItem divider></DropdownItem>

            {/* Page path */}
            <CopyToClipboard text={this.props.pagePath} onCopy={this.showToolTip}>
              <DropdownItem>
                <div className="d-inline-flex flex-column">
                  <h6 className="mt-1 mb-2"><strong>{ t('copy_to_clipboard.Page path') }</strong></h6>
                  <span className="small">{safePagePath}</span>
                </div>
              </DropdownItem>
            </CopyToClipboard>
            {/* Parmanent Link */}
            { this.props.pageId && (
              <CopyToClipboard text={url} onCopy={this.showToolTip}>
                <DropdownItem>
                  <div className="d-inline-flex flex-column">
                    <h6 className="mt-1 mb-2"><strong>{ t('copy_to_clipboard.Parmanent link') }</strong></h6>
                    <span className="small">{url}</span>
                  </div>
                </DropdownItem>
              </CopyToClipboard>
            )}
            {/* Page path + Parmanent Link */}
            { this.props.pageId && (
              <CopyToClipboard text={`${this.props.pagePath}\n${url}`} onCopy={this.showToolTip}>
                <DropdownItem>
                  <div className="d-inline-flex flex-column">
                    <h6 className="mt-1 mb-2"><strong>{ t('copy_to_clipboard.Page path and parmanent link') }</strong></h6>
                    <span className="small mb-1">{safePagePath}</span><br></br>
                    <span className="small">{url}</span>
                  </div>
                </DropdownItem>
              </CopyToClipboard>
            )}
            {/* Markdown Link */}
            { this.props.pageId && (
              <CopyToClipboard text={`[${this.props.pagePath}](${url})`} onCopy={this.showToolTip}>
                <DropdownItem>
                  <div className="d-inline-flex flex-column">
                    <h6 className="mt-1 mb-2"><strong>{ t('copy_to_clipboard.Markdown link') }</strong></h6>
                    <span className="small">{`[${safePagePath}](${url})`}</span>
                  </div>
                </DropdownItem>
              </CopyToClipboard>
            )}
          </DropdownMenu>

        </Dropdown>

        <Tooltip placement="bottom" isOpen={this.state.tooltipOpen} target="copyPagePathDropdown" fade={false}>
          copied!
        </Tooltip>
      </>
    );
  }

}

CopyDropdown.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  pagePath: PropTypes.string.isRequired,
  pageId: PropTypes.string,
  buttonStyle: PropTypes.object,
};
