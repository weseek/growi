import React, { useState } from 'react';

import { pagePathUtils } from '@growi/core';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from 'next-i18next';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';


import RevisionComparerContainer from '~/client/services/RevisionComparerContainer';

import RevisionDiff from '../PageHistory/RevisionDiff';
import { withUnstatedContainers } from '../UnstatedUtils';


const { encodeSpaces } = pagePathUtils;

/* eslint-disable react/prop-types */
const DropdownItemContents = ({ title, contents }) => (
  <>
    <div className="h6 mt-1 mb-2"><strong>{title}</strong></div>
    <div className="card well mb-1 p-2">{contents}</div>
  </>
);
/* eslint-enable react/prop-types */


const RevisionComparer = (props) => {

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { t } = useTranslation();
  const { revisionComparerContainer } = props;

  const { path, pageId } = revisionComparerContainer.pageContainer.state;

  function toggleDropdown() {
    setDropdownOpen(!dropdownOpen);
  }

  const generateURL = (pathName) => {
    const { origin } = window.location;
    const { sourceRevision, targetRevision } = revisionComparerContainer.state;

    const url = new URL(pathName, origin);

    if (sourceRevision != null && targetRevision != null) {
      const urlParams = `${sourceRevision._id}...${targetRevision._id}`;
      url.searchParams.set('compare', urlParams);
    }

    return encodeSpaces(decodeURI(url));

  };

  const { sourceRevision, targetRevision } = revisionComparerContainer.state;

  if (sourceRevision == null || targetRevision == null) {
    return null;
  }

  const isNodiff = sourceRevision._id === targetRevision._id;

  return (
    <div className="revision-compare">
      <div className="d-flex">
        <h4 className="align-self-center">{ t('page_history.comparing_revisions') }</h4>
        <Dropdown
          className="grw-copy-dropdown align-self-center ml-auto"
          isOpen={dropdownOpen}
          toggle={() => toggleDropdown()}
        >
          <DropdownToggle
            caret
            className="d-block text-muted bg-transparent btn-copy border-0 py-0"
          >
            <i className="ti-clipboard"></i>
          </DropdownToggle>
          <DropdownMenu positionFixed right modifiers={{ preventOverflow: { boundariesElement: undefined } }}>
            {/* Page path URL */}
            <CopyToClipboard text={generateURL(path)}>
              <DropdownItem className="px-3">
                <DropdownItemContents title={t('copy_to_clipboard.Page URL')} contents={generateURL(path)} />
              </DropdownItem>
            </CopyToClipboard>
            {/* Permanent Link URL */}
            <CopyToClipboard text={generateURL(pageId)}>
              <DropdownItem className="px-3">
                <DropdownItemContents title={t('copy_to_clipboard.Permanent link')} contents={generateURL(pageId)} />
              </DropdownItem>
            </CopyToClipboard>
            <DropdownItem divider className="my-0"></DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className={`revision-compare-container ${isNodiff ? 'nodiff' : ''}`}>
        { isNodiff
          ? (
            <span className="h3 text-muted">{t('No diff')}</span>
          )
          : (
            <RevisionDiff
              revisionDiffOpened
              previousRevision={sourceRevision}
              currentRevision={targetRevision}
            />
          )
        }
      </div>
    </div>
  );
};

RevisionComparer.propTypes = {
  revisionComparerContainer: PropTypes.instanceOf(RevisionComparerContainer).isRequired,
  revisions: PropTypes.array,
};

/**
 * Wrapper component for using unstated
 */
const RevisionComparerWrapper = withUnstatedContainers(RevisionComparer, [RevisionComparerContainer]);

export default RevisionComparerWrapper;
