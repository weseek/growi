import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { withUnstatedContainers } from './UnstatedUtils';

import RevisionCompareContainer from '../services/RevisionCompareContainer';

import RevisionDiff from './PageHistory/RevisionDiff';
import RevisionIdForm from './RevisionCompare/RevisionIdForm';

/* eslint-disable react/prop-types */
const DropdownItemContents = ({ title, contents }) => (
  <>
    <div className="h6 mt-1 mb-2"><strong>{title}</strong></div>
    <div className="card well mb-1 p-2">{contents}</div>
  </>
);
/* eslint-enable react/prop-types */

function encodeSpaces(str) {
  if (str == null) {
    return null;
  }

  // Encode SPACE and IDEOGRAPHIC SPACE
  return str.replace(/ /g, '%20').replace(/\u3000/g, '%E3%80%80');
}

const PageCompare = (props) => {

  function toggleDropdown() {
    setDropdownOpen(!dropdownOpen);
  }

  const pagePathUrl = () => {
    const { origin } = window.location;
    const { path } = revisionCompareContainer.pageContainer.state;
    const { fromRevision, toRevision } = revisionCompareContainer.state;

    const urlParams = (fromRevision && toRevision ? `?compare=${fromRevision._id}...${toRevision._id}` : '');
    return encodeSpaces(decodeURI(`${origin}/${path}${urlParams}`));
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { t, revisionCompareContainer } = props;

  const fromRev = revisionCompareContainer.state.fromRevision;
  const toRev = revisionCompareContainer.state.toRevision;
  const showDiff = (fromRev && toRev);

  return (
    <React.Fragment>
      <div className="float-left">{t('page_history.comparing_changes')}</div>
      <div className="mb-3">
        <Dropdown
          className="grw-copy-dropdown"
          isOpen={dropdownOpen}
          toggle={() => toggleDropdown()}
        >
          <DropdownToggle
            caret
            className="d-block text-muted bg-transparent btn-copy border-0 py-0"
          >
            <i className="ti-clipboard"></i>
          </DropdownToggle>
          <DropdownMenu positionFixed modifiers={{ preventOverflow: { boundariesElement: null } }}>
            {/* Page path URL */}
            <CopyToClipboard text={pagePathUrl()}>
              <DropdownItem className="px-3">
                <DropdownItemContents title={t('copy_to_clipboard.Page URL')} contents={pagePathUrl()} />
              </DropdownItem>
            </CopyToClipboard>
            <DropdownItem divider className="my-0"></DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="clearfix"></div>

      <RevisionIdForm />

      { showDiff && (
        <RevisionDiff
          revisionDiffOpened
          previousRevision={fromRev}
          currentRevision={toRev}
        />
      )}
    </React.Fragment>
  );
}

/**
 * Wrapper component for using unstated
 */
const PageCompareWrapper = withUnstatedContainers(PageCompare, [RevisionCompareContainer]);

PageCompare.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  revisionCompareContainer: PropTypes.instanceOf(RevisionCompareContainer).isRequired,

  revisions: PropTypes.array,
};

export default withTranslation()(PageCompareWrapper);
