import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
  Tooltip,
} from 'reactstrap';

import { CopyToClipboard } from 'react-copy-to-clipboard';

class CopyDropdown extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false,
      tooltipOpen: false,
      isParamsAppended: true,
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

  get uriParams() {
    const { isParamsAppended } = this.state;

    if (!isParamsAppended) {
      return '';
    }

    const {
      search, hash,
    } = window.location;
    return `${search}${hash}`;
  }

  generatePagePathWithParams() {
    const { pagePath } = this.props;
    return decodeURI(`${pagePath}${this.uriParams}`);
  }

  generatePagePathUrl() {
    const { origin } = window.location;
    return `${origin}${this.generatePagePathWithParams()}`;
  }

  generatePermalink() {
    const { pageId } = this.props;

    if (pageId == null) {
      return null;
    }

    return decodeURI(`${origin}/${pageId}${this.uriParams}`);
  }

  generateShareLink() {
    const { pagePath } = this.props;
    return `http://localhost:3000${pagePath}`;
  }

  generateMarkdownLink() {
    const { pagePath } = this.props;
    const isShareLinkMode = pagePath.indexOf('/share/') !== -1;

    const label = decodeURI(`${pagePath}${this.uriParams}`);
    if (isShareLinkMode) {
      const permalink = this.generateShareLink();
      return `[${label}](${permalink})`;
    }
    const permalink = this.generatePermalink();

    return `[${label}](${permalink})`;
  }

  generateMarkdownShareLink() {
    return `[share link path](${this.generateShareLink()})`;
  }

  DropdownItemContents = ({ title, contents }) => (
    <>
      <div className="h6 mt-1 mb-2"><strong>{title}</strong></div>
      <div className="card well mb-1 p-2">{contents}</div>
    </>
  );

  render() {
    const { t, pageId, pagePath } = this.props;
    const { isParamsAppended } = this.state;

    const pagePathWithParams = this.generatePagePathWithParams();
    const pagePathUrl = this.generatePagePathUrl();
    const permalink = this.generatePermalink();

    const { DropdownItemContents } = this;
    const isShareLinkMode = pagePath.indexOf('/share/') !== -1;
    const copyTarget = isShareLinkMode ? `copyShareLink${pagePath.replace('/share/', '')}` : 'copyPagePathDropdown';
    const styleName = isShareLinkMode ? 'btn btn-success' : 'd-block text-muted bg-transparent btn-copy border-0';

    return (
      <>
        <UncontrolledDropdown id={copyTarget} className="grw-copy-dropdown">
          <DropdownToggle
            caret
            className={styleName}
            style={this.props.buttonStyle}
          >
            { isShareLinkMode ? (
              <>Copy Link</>
            ) : (<i className="ti-clipboard"></i>)}
          </DropdownToggle>

          <DropdownMenu>

            <div className="d-flex align-items-center justify-content-between">
              <DropdownItem header className="px-3">
                { t('copy_to_clipboard.Copy to clipboard') }
              </DropdownItem>
              <div className="px-3 custom-control custom-switch custom-switch-sm">
                <input
                  type="checkbox"
                  id="customSwitchForParams"
                  className="custom-control-input"
                  checked={isParamsAppended}
                  onChange={e => this.setState({ isParamsAppended: !isParamsAppended })}
                />
                <label className="custom-control-label small" htmlFor="customSwitchForParams">Append params</label>
              </div>
            </div>

            <DropdownItem divider className="my-0"></DropdownItem>

            {/* Page path */}
            { pageId && (
              <>
                <CopyToClipboard text={pagePathWithParams} onCopy={this.showToolTip}>
                  <DropdownItem className="px-3">
                    <DropdownItemContents title={t('copy_to_clipboard.Page path')} contents={pagePathWithParams} />
                  </DropdownItem>
                </CopyToClipboard>
                <DropdownItem divider className="my-0"></DropdownItem>
              </>
            )}

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
            { (pageId || pagePath) && (
              <CopyToClipboard text={this.generateMarkdownLink()} onCopy={this.showToolTip}>
                <DropdownItem className="px-3 text-wrap">
                  <DropdownItemContents title={t('copy_to_clipboard.Markdown link')} contents={this.generateMarkdownLink()} isContentsWrap />
                </DropdownItem>
              </CopyToClipboard>
            )}
          </DropdownMenu>

        </UncontrolledDropdown>

        <Tooltip placement="bottom" isOpen={this.state.tooltipOpen} target={copyTarget} fade={false}>
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
