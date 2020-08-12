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

  return (
    <>
      <div className="top-of-table-contents d-flex align-items-end pb-1">
        <button type="button" className="bg-transparent border-0" onClick={() => openPageAccessoriesModal('pagelist')}>
          <PageListIcon />
        </button>

        <button type="button" className="bg-transparent border-0 active" onClick={() => openPageAccessoriesModal('timeline')}>
          <TimeLineIcon />
        </button>

        <button type="button" className="bg-transparent border-0" onClick={() => openPageAccessoriesModal('recent-changes')}>
          <RecentChangesIcon />
        </button>

        <button type="button" className="bg-transparent border-0" onClick={() => openPageAccessoriesModal('attachment')}>
          <AttachmentIcon />
        </button>
        {/* [TODO: setting Footprints' icon by GW-3308] */}
        <div
          id="seen-user-list"
          data-user-ids-str="{{ page.seenUsers|slice(-15)|default([])|reverse|join(',') }}"
          data-sum-of-seen-users="{{ page.seenUsers.length|default(0) }}"
        >
        </div>
      </div>
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
