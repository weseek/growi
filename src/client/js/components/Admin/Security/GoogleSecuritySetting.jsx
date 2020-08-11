/* eslint-disable react/no-danger */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
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
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminGoogleSecurityContainer: PropTypes.instanceOf(AdminGoogleSecurityContainer).isRequired,
};

const GoogleSecurityManagementWithUnstatedContainer = withUnstatedContainers(GoogleSecurityManagement, [
  AppContainer,
  AdminGeneralSecurityContainer,
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
