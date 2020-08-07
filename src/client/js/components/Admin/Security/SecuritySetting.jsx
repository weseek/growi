import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

import SecuritySettingContents from './SecuritySettingContents';

function SecuritySettingWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <SecuritySettingWithUnstatedContainer />
    </Suspense>
  );
}

function SecuritySetting(props) {
  const { adminGeneralSecurityContainer } = props;
  if (adminGeneralSecurityContainer.state.currentRestrictGuestMode === adminGeneralSecurityContainer.dummyCurrentRestrictGuestMode) {
    throw new Promise(async() => {
      try {
        await adminGeneralSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        toastError(err);
        adminGeneralSecurityContainer.setState({ retrieveError: err.message });
      }
    });
  }

  return <SecuritySettingContents />;
}

SecuritySetting.propTypes = {
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const SecuritySettingWithUnstatedContainer = withUnstatedContainers(SecuritySetting, [AdminGeneralSecurityContainer]);

export default SecuritySettingWithContainerWithSuspense;
