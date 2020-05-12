import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
  Tooltip,
} from 'reactstrap';

import { CopyToClipboard } from 'react-copy-to-clipboard';

class CopyDropdown extends React.Component {

  constructor(props) {
    super(props);

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

  DropdownItemContents = ({ title, contents }) => (
    <>
      <div className="h6 mt-1 mb-2"><strong>{title}</strong></div>
      <div className="card well mb-1 p-2">{contents}</div>
    </>
  );

  render() {
    const { t, pagePath } = this.props;

    const url = this.generatePageUrl();

    const { DropdownItemContents } = this;

    return (
      <>
        <Dropdown id="copyPagePathDropdown" className="grw-copy-dropdown" isOpen={this.state.dropdownOpen} toggle={this.toggle}>

          <DropdownToggle
            caret
            className="d-block text-muted bg-transparent btn-copy border-0"
            style={this.props.buttonStyle}
          >
            <i className="ti-clipboard"></i>
          </DropdownToggle>

          <DropdownMenu>
            <DropdownItem header className="px-3">{ t('copy_to_clipboard.Copy to clipboard') }</DropdownItem>

            <DropdownItem divider className="my-0"></DropdownItem>

            {/* Page path */}
            <CopyToClipboard text={this.props.pagePath} onCopy={this.showToolTip}>
              <DropdownItem className="px-3">
                <DropdownItemContents title={t('copy_to_clipboard.Page path')} contents={pagePath} />
              </DropdownItem>
            </CopyToClipboard>

            <DropdownItem divider className="my-0"></DropdownItem>

            {/* Parmanent Link */}
            { this.props.pageId && (
              <CopyToClipboard text={url} onCopy={this.showToolTip}>
                <DropdownItem className="px-3">
                  <DropdownItemContents title={t('copy_to_clipboard.Parmanent link')} contents={url} />
                </DropdownItem>
              </CopyToClipboard>
            )}

            <DropdownItem divider className="my-0"></DropdownItem>

            {/* Page path + Parmanent Link */}
            { this.props.pageId && (
              <CopyToClipboard text={`${this.props.pagePath}\n${url}`} onCopy={this.showToolTip}>
                <DropdownItem className="px-3">
                  <DropdownItemContents title={t('copy_to_clipboard.Page path and parmanent link')} contents={<>{pagePath}<br />{url}</>} />
                </DropdownItem>
              </CopyToClipboard>
            )}

            <DropdownItem divider className="my-0"></DropdownItem>

            {/* Markdown Link */}
            { this.props.pageId && (
              <CopyToClipboard text={`[${this.props.pagePath}](${url})`} onCopy={this.showToolTip}>
                <DropdownItem className="px-3">
                  <DropdownItemContents title={t('copy_to_clipboard.Markdown link')} contents={`[${pagePath}](${url})`} />
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

export default withTranslation()(CopyDropdown);
