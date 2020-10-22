import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import PageAccessoriesContainer from '../services/PageAccessoriesContainer';

import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import RecentChangesIcon from './Icons/RecentChangesIcon';
import AttachmentIcon from './Icons/AttachmentIcon';
import ShareLinkIcon from './Icons/ShareLinkIcon';

import PageAccessoriesModal from './PageAccessoriesModal';

import { withUnstatedContainers } from './UnstatedUtils';

const TopOfTableContents = (props) => {
  const { pageAccessoriesContainer } = props;

  function renderModal() {
    return (
      <>
        <PageAccessoriesModal
          isOpen={pageAccessoriesContainer.state.isPageAccessoriesModalShown}
          onClose={pageAccessoriesContainer.closePageAccessoriesModal}
        />
      </>
    );
  }

  return (
    <>
      <div className="top-of-table-contents d-flex align-items-end pb-1">
        <button
          type="button"
          className="btn btn-link grw-btn-top-of-table"
          onClick={() => pageAccessoriesContainer.openPageAccessoriesModal('pagelist')}
        >
          <PageListIcon />
        </button>

        <button
          type="button"
          className="btn btn-link grw-btn-top-of-table"
          onClick={() => pageAccessoriesContainer.openPageAccessoriesModal('timeline')}
        >
          <TimeLineIcon />
        </button>

        <button
          type="button"
          className="btn btn-link grw-btn-top-of-table"
          onClick={() => pageAccessoriesContainer.openPageAccessoriesModal('pageHistory')}
        >
          <RecentChangesIcon />
        </button>

        <button
          type="button"
          className="btn btn-link grw-btn-top-of-table"
          onClick={() => pageAccessoriesContainer.openPageAccessoriesModal('attachment')}
        >
          <AttachmentIcon />
        </button>

        <button
          type="button"
          className="btn btn-link grw-btn-top-of-table"
          onClick={() => pageAccessoriesContainer.openPageAccessoriesModal('shareLink')}
        >
          <ShareLinkIcon />
        </button>

        <div
          id="seen-user-list"
          data-user-ids-str="{{ page.seenUsers|slice(-15)|default([])|reverse|join(',') }}"
          data-sum-of-seen-users="{{ page.seenUsers.length|default(0) }}"
          className="grw-seen-user-list ml-1 pl-1"
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
const TopOfTableContentsWrapper = withUnstatedContainers(TopOfTableContents, [PageAccessoriesContainer]);

TopOfTableContents.propTypes = {
  pageAccessoriesContainer: PropTypes.instanceOf(PageAccessoriesContainer).isRequired,
};

export default withTranslation()(TopOfTableContentsWrapper);
