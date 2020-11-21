import React, {
  useState, useMemo, useCallback,
} from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
  Tooltip,
} from 'reactstrap';

import { CopyToClipboard } from 'react-copy-to-clipboard';

function encodeSpaces(str) {
  if (str == null) {
    return null;
  }

  // Encode SPACE and IDEOGRAPHIC SPACE
  return str.replace(/ /g, '%20').replace(/\u3000/g, '%E3%80%80');
}


/* eslint-disable react/prop-types */
const DropdownItemContents = ({ title, contents }) => (
  <>
    <div className="h6 mt-1 mb-2"><strong>{title}</strong></div>
    <div className="card well mb-1 p-2">{contents}</div>
  </>
);
/* eslint-enable react/prop-types */


const CopyDropdown = (props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [isParamsAppended, setParamsAppended] = useState(true);

  // states for labels and URLs
  const [pagePathUrl, setPagePathUrl] = useState();
  const [permalink, setParmalink] = useState();
  const [markdownLink, setMarkdownLink] = useState();


  /*
   * functions to construct labels and URLs
   */
  const getUriParams = useCallback(() => {
    if (!isParamsAppended) {
      return '';
    }

    const {
      search, hash,
    } = window.location;

    return `${search}${hash}`;
  }, [isParamsAppended]);

  const pagePathWithParams = useMemo(() => {
    const { pagePath } = props;
    return decodeURI(`${pagePath}${getUriParams()}`);
  }, [props, getUriParams]);

  const generatePagePathUrl = useCallback(() => {
    const { origin } = window.location;
    return `${origin}${encodeSpaces(pagePathWithParams)}`;
  }, [pagePathWithParams]);

  const generatePermalink = useCallback(() => {
    const { origin } = window.location;
    const { pageId, isShareLinkMode } = props;

    if (pageId == null) {
      return null;
    }
    if (isShareLinkMode) {
      return decodeURI(`${origin}/share/${pageId}`);
    }

    return encodeSpaces(decodeURI(`${origin}/${pageId}${getUriParams()}`));
  }, [props, getUriParams]);

  const generateMarkdownLink = useCallback(() => {
    const { pagePath } = props;

    const label = decodeURI(`${pagePath}${getUriParams()}`);
    const permalink = generatePermalink();

    return `[${label}](${permalink})`;
  }, [props, getUriParams, generatePermalink]);


  /**
   * dropdown control
   */
  const toggle = useCallback(() => {
    // regenerate labels and URLs
    if (!dropdownOpen) {
      setPagePathUrl(generatePagePathUrl());
      setParmalink(generatePermalink());
      setMarkdownLink(generateMarkdownLink());
    }

    setDropdownOpen(!dropdownOpen);
  }, [dropdownOpen, generatePagePathUrl, generatePermalink, generateMarkdownLink]);

  /**
   * tooltip control
   */
  const showToolTip = useCallback(() => {
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
    }, 1000);
  }, []);


  /*
   * render
   */
  const {
    t, pageId, isShareLinkMode, buttonStyle,
  } = props;

  const copyTarget = isShareLinkMode ? `copyShareLink${pageId}` : 'copyPagePathDropdown';
  const dropdownToggleStyle = isShareLinkMode ? 'btn btn-secondary' : 'd-block text-muted bg-transparent btn-copy border-0';

  const customSwitchForParamsId = `customSwitchForParams_${pageId}`;


  return (
    <>
      <Dropdown id={copyTarget} className="grw-copy-dropdown" isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle
          caret
          className={dropdownToggleStyle}
          style={buttonStyle}
        >
          { isShareLinkMode ? (
            <>Copy Link</>
          ) : (<i className="ti-clipboard"></i>)}
        </DropdownToggle>

        <DropdownMenu positionFixed modifiers={{ preventOverflow: { boundariesElement: null } }}>

          <div className="d-flex align-items-center justify-content-between">
            <DropdownItem header className="px-3">
              { t('copy_to_clipboard.Copy to clipboard') }
            </DropdownItem>
            <div className="px-3 custom-control custom-switch custom-switch-sm">
              <input
                type="checkbox"
                id={customSwitchForParamsId}
                className="custom-control-input"
                checked={isParamsAppended}
                onChange={() => setParamsAppended(!isParamsAppended)}
              />
              <label className="custom-control-label small" htmlFor={customSwitchForParamsId}>Append params</label>
            </div>
          </div>

          <DropdownItem divider className="my-0"></DropdownItem>

          {/* Page path */}
          <CopyToClipboard text={pagePathWithParams} onCopy={showToolTip}>
            <DropdownItem className="px-3">
              <DropdownItemContents title={t('copy_to_clipboard.Page path')} contents={pagePathWithParams} />
            </DropdownItem>
          </CopyToClipboard>

          <DropdownItem divider className="my-0"></DropdownItem>

          {/* Page path URL */}
          <CopyToClipboard text={pagePathUrl} onCopy={showToolTip}>
            <DropdownItem className="px-3">
              <DropdownItemContents title={t('copy_to_clipboard.Page URL')} contents={pagePathUrl} />
            </DropdownItem>
          </CopyToClipboard>
          <DropdownItem divider className="my-0"></DropdownItem>

          {/* Permanent Link */}
          { pageId && (
            <CopyToClipboard text={permalink} onCopy={showToolTip}>
              <DropdownItem className="px-3">
                <DropdownItemContents title={t('copy_to_clipboard.Permanent link')} contents={permalink} />
              </DropdownItem>
            </CopyToClipboard>
          )}

          <DropdownItem divider className="my-0"></DropdownItem>

          {/* Page path + Permanent Link */}
          { pageId && (
            <CopyToClipboard text={`${pagePathWithParams}\n${permalink}`} onCopy={showToolTip}>
              <DropdownItem className="px-3">
                <DropdownItemContents title={t('copy_to_clipboard.Page path and permanent link')} contents={<>{pagePathWithParams}<br />{permalink}</>} />
              </DropdownItem>
            </CopyToClipboard>
          )}

          <DropdownItem divider className="my-0"></DropdownItem>

          {/* Markdown Link */}
          { pageId && (
            <CopyToClipboard text={markdownLink} onCopy={showToolTip}>
              <DropdownItem className="px-3 text-wrap">
                <DropdownItemContents title={t('copy_to_clipboard.Markdown link')} contents={markdownLink} isContentsWrap />
              </DropdownItem>
            </CopyToClipboard>
          )}
        </DropdownMenu>

      </Dropdown>

      <Tooltip placement="bottom" isOpen={tooltipOpen} target={copyTarget} fade={false}>
        copied!
      </Tooltip>
    </>
  );
};

CopyDropdown.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  pagePath: PropTypes.string.isRequired,
  pageId: PropTypes.string,
  buttonStyle: PropTypes.object,
  isShareLinkMode: PropTypes.bool,
};

export default withTranslation()(CopyDropdown);
