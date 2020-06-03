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
    this.generatePagePathWithParams = this.generatePagePathWithParams.bind(this);
    this.generatePagePathUrl = this.generatePagePathUrl.bind(this);
    this.generatePermalink = this.generatePermalink.bind(this);
    this.generateMarkdownLink = this.generateMarkdownLink.bind(this);
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

  generatePagePathWithParams() {
    const { pagePath } = this.props;
    const {
      search, hash,
    } = window.location;

    return decodeURI(`${pagePath}${search}${hash}`);
  }

  generatePagePathUrl() {
    const { origin } = window.location;
    return `${origin}${this.generatePagePathWithParams()}`;
  }

  generatePermalink() {
    const { pageId } = this.props;
    const { location } = window;

    if (pageId == null) {
      return null;
    }

    const {
      origin, search, hash,
    } = location;
    return decodeURI(`${origin}/${pageId}${search}${hash}`);
  }

  generateMarkdownLink() {
    const { pagePath } = this.props;
    const {
      search, hash,
    } = window.location;

    const label = decodeURI(`${pagePath}${search}${hash}`);
    const permalink = this.generatePermalink();

    return `[${label}](${permalink})`;
  }

  DropdownItemContents = ({ title, contents }) => (
    <>
      <div className="h6 mt-1 mb-2"><strong>{title}</strong></div>
      <div className="card well mb-1 p-2">{contents}</div>
    </>
  );

  render() {
    const { t, pageId } = this.props;

    const pagePathWithParams = this.generatePagePathWithParams();
    const pagePathUrl = this.generatePagePathUrl();
    const permalink = this.generatePermalink();

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
            <CopyToClipboard text={pagePathWithParams} onCopy={this.showToolTip}>
              <DropdownItem className="px-3">
                <DropdownItemContents title={t('copy_to_clipboard.Page path')} contents={pagePathWithParams} />
              </DropdownItem>
            </CopyToClipboard>

            <DropdownItem divider className="my-0"></DropdownItem>

            {/* Page path URL */}
            <CopyToClipboard text={pagePathUrl} onCopy={this.showToolTip}>
              <DropdownItem className="px-3">
                <DropdownItemContents title={t('copy_to_clipboard.Page URL')} contents={pagePathUrl} />
              </DropdownItem>
            </CopyToClipboard>

            <DropdownItem divider className="my-0"></DropdownItem>

            {/* Parmanent Link */}
            { pageId && (
              <CopyToClipboard text={permalink} onCopy={this.showToolTip}>
                <DropdownItem className="px-3">
                  <DropdownItemContents title={t('copy_to_clipboard.Parmanent link')} contents={permalink} />
                </DropdownItem>
              </CopyToClipboard>
            )}

            <DropdownItem divider className="my-0"></DropdownItem>

            {/* Page path + Parmanent Link */}
            { pageId && (
              <CopyToClipboard text={`${pagePathWithParams}\n${permalink}`} onCopy={this.showToolTip}>
                <DropdownItem className="px-3">
                  <DropdownItemContents title={t('copy_to_clipboard.Page path and parmanent link')} contents={<>{pagePathWithParams}<br />{permalink}</>} />
                </DropdownItem>
              </CopyToClipboard>
            )}

            <DropdownItem divider className="my-0"></DropdownItem>

            {/* Markdown Link */}
            { pageId && (
              <CopyToClipboard text={this.generateMarkdownLink()} onCopy={this.showToolTip}>
                <DropdownItem className="px-3 text-wrap">
                  <DropdownItemContents title={t('copy_to_clipboard.Markdown link')} contents={this.generateMarkdownLink()} isContentsWrap />
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
