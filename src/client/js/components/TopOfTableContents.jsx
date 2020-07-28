import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import PageContainer from '../services/PageContainer';

import PageList from './PageList';
import TimeLine from './TimeLine';
import RecentChanges from './RecentChanges';
import Attachment from './Attachment';

import { withUnstatedContainers } from './UnstatedUtils';

const TopOfTableContents = (props) => {

  return (
    <>
      <div className="top-of-table-contents d-flex align-items-end pb-1">
        <button type="button" className="bg-transparent border-0">
          <PageList />
        </button>

        <button type="button" className="bg-transparent border-0">
          <TimeLine />
        </button>

        <button type="button" className="bg-transparent border-0">
          <RecentChanges />
        </button>

        <button type="button" className="bg-transparent border-0">
          <Attachment />
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
