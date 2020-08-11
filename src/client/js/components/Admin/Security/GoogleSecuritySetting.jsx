/* eslint-disable react/no-danger */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminGoogleSecurityContainer from '../../../services/AdminGoogleSecurityContainer';
import GoogleSecurityManagementContents from './GoogleSecuritySettingContents';

function GoogleSecurityManagement(props) {

  const { adminGoogleSecurityContainer } = props;
  if (adminGoogleSecurityContainer.state.googleClientId === adminGoogleSecurityContainer.dummyGoogleClientId) {
    throw new Promise(async() => {
      try {
        await adminGoogleSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        toastError(err);
        adminGoogleSecurityContainer.setState({ retrieveError: err.message });
      }
    });
  }

  return <GoogleSecurityManagementContents />;
}


GoogleSecurityManagement.propTypes = {
  adminGoogleSecurityContainer: PropTypes.instanceOf(AdminGoogleSecurityContainer).isRequired,
};

const GoogleSecurityManagementWithUnstatedContainer = withUnstatedContainers(GoogleSecurityManagement, [
  AdminGoogleSecurityContainer,
]);

function GoogleSecurityManagementWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <GoogleSecurityManagementWithUnstatedContainer />
    </Suspense>
  );
}

export default GoogleSecurityManagementWithContainerWithSuspense;
