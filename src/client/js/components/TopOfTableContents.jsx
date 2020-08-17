import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import PageContainer from '../services/PageContainer';

import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import RecentChangesIcon from './Icons/RecentChangesIcon';
import AttachmentIcon from './Icons/AttachmentIcon';

import PageAccessoriesModal from './PageAccessoriesModal';

import { withUnstatedContainers } from './UnstatedUtils';

const TopOfTableContents = (props) => {

  const [isPageAccessoriesModalShown, setIsPageAccessoriesModalShown] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  // Prevent unnecessary rendering
  const [activeComponents, setActiveComponents] = useState(new Set(['']));

  function openPageAccessoriesModal(activeTab) {
    setIsPageAccessoriesModalShown(true);
    setActiveTab(activeTab);
  }

  function switchActiveTab(clickedTab) {
    activeComponents.add(clickedTab);
    setActiveComponents(activeComponents);
    setActiveTab(clickedTab);
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
          activeTab={activeTab}
          onSwitch={switchActiveTab}
        />
      </>
    );
  }

  return (
    <>
      <div className="top-of-table-contents d-flex align-items-center pb-1 ">
        <div className="icon-button-box pr-2 mr-2">

          <button type="button" className="bg-transparent border-0" onClick={() => openPageAccessoriesModal('pageList')}>
            <div className="grw-table-top-icons ">
              <PageListIcon />
            </div>
          </button>

          <button type="button" className="bg-transparent border-0" onClick={() => openPageAccessoriesModal('timeLine')}>
            <div className="grw-table-top-icons ">
              <TimeLineIcon />
            </div>
          </button>

          <button type="button" className="bg-transparent border-0" onClick={() => openPageAccessoriesModal('recentChanges')}>
            <div className="grw-table-top-icons ">
              <RecentChangesIcon />
            </div>
          </button>

          <button type="button" className="bg-transparent border-0 " onClick={() => openPageAccessoriesModal('attachment')}>
            <div className="grw-table-top-icons ">
              <AttachmentIcon />
            </div>
          </button>

        </div>
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
