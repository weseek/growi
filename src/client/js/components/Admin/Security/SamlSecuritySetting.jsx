/* eslint-disable react/no-danger */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminSamlSecurityContainer from '../../../services/AdminSamlSecurityContainer';

import SamlSecuritySettingContents from './SamlSecuritySettingContents';

function SamlSecurityManagement(props) {

  const { adminSamlSecurityContainer } = props;
  if (adminSamlSecurityContainer.state.samlEntryPoint === adminSamlSecurityContainer.dummySamlEntryPoint) {
    throw new Promise(async() => {
      try {
        await adminSamlSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        toastError(err);
        adminSamlSecurityContainer.setState({ retrieveError: err.message });
      }
    });
  }

  return <SamlSecuritySettingContents />;
}

SamlSecurityManagement.propTypes = {
  adminSamlSecurityContainer: PropTypes.instanceOf(AdminSamlSecurityContainer).isRequired,
};

const SamlSecurityManagementWithUnstatedContainer = withUnstatedContainers(SamlSecurityManagement, [
  AdminSamlSecurityContainer,
]);

function SamlSecurityManagementWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <SamlSecurityManagementWithUnstatedContainer />
    </Suspense>
  );
}

export default SamlSecurityManagementWithContainerWithSuspense;
