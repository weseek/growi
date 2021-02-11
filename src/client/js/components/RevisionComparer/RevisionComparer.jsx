import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { withUnstatedContainers } from '../UnstatedUtils';

import RevisionComparerContainer from '../../services/RevisionComparerContainer';

import RevisionDiff from '../PageHistory/RevisionDiff';

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

const RevisionComparer = (props) => {

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { t, revisionComparerContainer } = props;

  function toggleDropdown() {
    setDropdownOpen(!dropdownOpen);
  }

  const pagePathUrl = () => {
    const { origin } = window.location;
    const { path } = revisionComparerContainer.pageContainer.state;
    const { sourceRevision, targetRevision } = revisionComparerContainer.state;

    const urlParams = (sourceRevision && targetRevision ? `?compare=${sourceRevision._id}...${targetRevision._id}` : '');
    return encodeSpaces(decodeURI(`${origin}/${path}${urlParams}`));
  };

  const { sourceRevision, targetRevision } = revisionComparerContainer.state;
  const showDiff = (sourceRevision && targetRevision);

  return (
    <div className="revision-compare">
      <div className="d-flex">
        <h3 className="align-self-center mb-0">{ t('page_history.comparing_revisions') }</h3>
        <div className="align-self-center ml-3">
          <div className="custom-control custom-switch">
            <input
              type="checkbox"
              className="custom-control-input"
              id="comparingWithLatest"
              checked={revisionComparerContainer.state.compareWithLatest}
              onChange={() => revisionComparerContainer.toggleCompareWithLatest()}
            />
            <label className="custom-control-label" htmlFor="comparingWithLatest">
              { t('page_history.comparing_with_latest') }
            </label>
          </div>
        </div>
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

      <hr />

      <div className="revision-compare-outer">
        { showDiff && (
          <RevisionDiff
            revisionDiffOpened
            previousRevision={sourceRevision}
            currentRevision={targetRevision}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const RevisionComparerWrapper = withUnstatedContainers(RevisionComparer, [RevisionComparerContainer]);

RevisionComparer.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  revisionComparerContainer: PropTypes.instanceOf(RevisionComparerContainer).isRequired,

  revisions: PropTypes.array,
};

export default withTranslation()(RevisionComparerWrapper);
