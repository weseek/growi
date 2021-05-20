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

import { encodeSpaces } from '~/utils/path-utils';

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
  const [isParamsAppended, setParamsAppended] = useState(!props.isShareLinkMode);

  /*
   * functions to construct labels and URLs
   */
  const getUriParams = useCallback(() => {
    if (!isParamsAppended || !dropdownOpen) {
      return '';
    }

    const {
      search, hash,
    } = window.location;

    return `${search}${hash}`;
  }, [isParamsAppended, dropdownOpen]);

  const pagePathWithParams = useMemo(() => {
    const { pagePath } = props;
    return decodeURI(`${pagePath}${getUriParams()}`);
  }, [props, getUriParams]);

  const pagePathUrl = useMemo(() => {
    const { origin } = window.location;
    return `${origin}${encodeSpaces(pagePathWithParams)}`;
  }, [pagePathWithParams]);

  const permalink = useMemo(() => {
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

  const markdownLink = useMemo(() => {
    const { pagePath } = props;

    const label = decodeURI(`${pagePath}${getUriParams()}`);
    // const permalink = generatePermalink();

    return `[${label}](${permalink})`;
  }, [props, getUriParams, permalink]);


  /**
   * control
   */
  const toggleDropdown = useCallback(() => {
    setDropdownOpen(!dropdownOpen);
  }, [dropdownOpen]);

  const toggleAppendParams = useCallback(() => {
    setParamsAppended(!isParamsAppended);
  }, [isParamsAppended]);

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
    t, dropdownToggleId, pageId, dropdownToggleClassName, children, isShareLinkMode,
  } = props;

  const customSwitchForParamsId = `customSwitchForParams_${dropdownToggleId}`;

  return (
    <>
      <Dropdown className="grw-copy-dropdown" isOpen={dropdownOpen} toggle={toggleDropdown}>
        <DropdownToggle
          caret
          className={dropdownToggleClassName}
        >
          <span id={dropdownToggleId}>{children}</span>
        </DropdownToggle>

        <DropdownMenu positionFixed>

          <div className="d-flex align-items-center justify-content-between">
            <DropdownItem header className="px-3">
              { t('copy_to_clipboard.Copy to clipboard') }
            </DropdownItem>
            { !isShareLinkMode && (
              <div className="px-3 custom-control custom-switch custom-switch-sm">
                <input
                  type="checkbox"
                  id={customSwitchForParamsId}
                  className="custom-control-input"
                  checked={isParamsAppended}
                  onChange={toggleAppendParams}
                />
                <label className="custom-control-label small" htmlFor={customSwitchForParamsId}>Append params</label>
              </div>
            ) }
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

      <Tooltip placement="bottom" isOpen={tooltipOpen} target={dropdownToggleId} fade={false}>
        copied!
      </Tooltip>
    </>
  );
};

CopyDropdown.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  children: PropTypes.node.isRequired,
  dropdownToggleId: PropTypes.string.isRequired,
  pagePath: PropTypes.string.isRequired,

  pageId: PropTypes.string,
  dropdownToggleClassName: PropTypes.string,
  isShareLinkMode: PropTypes.bool,
};

export default withTranslation()(CopyDropdown);
