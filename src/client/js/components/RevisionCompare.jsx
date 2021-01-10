import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';
import RevisionCompareContainer from '../services/RevisionCompareContainer';
import RevisionDiff from './PageHistory/RevisionDiff';

import RevisionIdForm from './RevisionCompare/RevisionIdForm';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';


const DropdownItemContents = ({ title, contents }) => (
  <>
    <div className="h6 mt-1 mb-2"><strong>{title}</strong></div>
    <div className="card well mb-1 p-2">{contents}</div>
  </>
);

function encodeSpaces(str) {
  if (str == null) {
    return null;
  }

  // Encode SPACE and IDEOGRAPHIC SPACE
  return str.replace(/ /g, '%20').replace(/\u3000/g, '%E3%80%80');
}

class PageCompare extends React.Component {
  constructor() {
    super();

    this.state = {
      dropdownOpen: false
    }

    this.toggleDropdown = this.toggleDropdown.bind(this);
  }

  componentWillMount() {
    const { revisionCompareContainer } = this.props;
    revisionCompareContainer.readyRevisions();
  }

  toggleDropdown() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  render() {
    const { t, revisionCompareContainer } = this.props;

    const fromRev = revisionCompareContainer.state.fromRevision;
    const toRev = revisionCompareContainer.state.toRevision;
    const showDiff = (fromRev && toRev);

    const { pageId } = revisionCompareContainer.pageContainer.state;

    const pagePathUrl = () => {
      const { origin } = window.location;
      const { path } = revisionCompareContainer.pageContainer.state;
      const { fromRevision, toRevision } = revisionCompareContainer.state;

      const urlParams = (fromRevision && toRevision ? `?compare=${fromRevision._id}...${toRevision._id}` : "");
      return encodeSpaces(decodeURI(`${origin}/${path}${urlParams}`));
    }

    return (
      <div id="revision-compare-content">
        <div>{ t('page_compare_revision.comparing_changes') }</div>
        <RevisionIdForm />
        <div className="card card-compare">
          <div className="card-body">

            <div className="container-fluid px-0">
              <div className="row">
                <div className="col-sm">
                  { fromRev && fromRev._id }<i className="icon-arrow-right-circle mx-1"></i>{ toRev && toRev._id }
                </div>
                <div className="col-sm">
                  <Dropdown className="grw-copy-dropdown" isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
                    <DropdownToggle
                      caret
                      className={'d-block text-muted bg-transparent btn-copy border-0 py-0'}
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
              </div>
            </div>

          </div>
        </div>
        { showDiff &&
          <RevisionDiff
            revisionDiffOpened={ true }
            previousRevision={ fromRev }
            currentRevision={ toRev }
          />
        }
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const PageCompareWrapper = withUnstatedContainers(PageCompare, [RevisionCompareContainer]);

PageCompare.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  revisionCompareContainer: PropTypes.instanceOf(RevisionCompareContainer).isRequired,
};

export default withTranslation()(PageCompareWrapper);
