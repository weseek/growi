import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import PageContainer from '../services/PageContainer';

import PageList from './PageList';
import TimeLine from './TimeLine';
import RecentChanges from './RecentChanges';
import Attachment from './Attachment';

import PageAccessoriesModal from './PageAccessoriesModal';

import { withUnstatedContainers } from './UnstatedUtils';

const TopOfTableContents = (props) => {

  const [isPageAccessoriesModalShown, setIsPageAccessoriesModalShown] = useState(false);

  function openPageAccessoriesModal() {
    setIsPageAccessoriesModalShown(true);
  }

  function closePageAccessoriesModal() {
    setIsPageAccessoriesModalShown(false);
  }

  function renderModal() {
    return (
      <>
        <PageAccessoriesModal
          isOpen={isPageAccessoriesModalShown}
          onClose={closePageAccessoriesModal}
        />
      </>
    );
  }

  return (
    <>
      <div className="top-of-table-contents d-flex align-items-end pb-1">
        <button type="button" className="bg-transparent border-0" onClick={openPageAccessoriesModal}>
          <PageList />
        </button>

        <button type="button" className="bg-transparent border-0">
          <TimeLine /* onClick=penTopOfTableContentsModal */ />
        </button>

        <button type="button" className="bg-transparent border-0">
          <RecentChanges /* onClick=this.openTopOfTableContentsModal */ />
        </button>

        <button type="button" className="bg-transparent border-0">
          <Attachment /* onClick=this.openTopOfTableContentsModal */ />
        </button>
        {/* [TODO: setting Footprints' icon by GW-3308] */}
        <div
          id="seen-user-list"
          data-user-ids-str="{{ page.seenUsers|slice(-15)|default([])|reverse|join(',') }}"
          data-sum-of-seen-users="{{ page.seenUsers.length|default(0) }}"
        >
        </div>
      </div>
      {renderModal()}
    </>
  );
};
/**
 * Wrapper component for using unstated
 */
const TopOfTableContentsWrapper = withUnstatedContainers(TopOfTableContents, [PageContainer]);

TopOfTableContents.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(TopOfTableContentsWrapper);
